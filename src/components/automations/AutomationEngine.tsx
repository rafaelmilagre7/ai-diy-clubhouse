import { supabase } from "@/integrations/supabase/client";

interface AutomationContext {
  webhookPayload: any;
  eventType: string;
  triggeredAt: Date;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: string;
}

interface ConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: (Condition | ConditionGroup)[];
}

export class AutomationEngine {
  /**
   * Processa todas as regras ativas para um determinado evento
   */
  static async processWebhookEvent(eventType: string, payload: any) {
    console.log('[AutomationEngine] Processing webhook event:', eventType);
    
    try {
      // Buscar regras ativas que correspondem ao evento
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)
        .eq('rule_type', 'webhook')
        .order('priority', { ascending: false });

      if (error) {
        console.error('[AutomationEngine] Error fetching rules:', error);
        return { success: false, error: error.message };
      }

      if (!rules || rules.length === 0) {
        console.log('[AutomationEngine] No active rules found');
        return { success: true, message: 'No active rules to process' };
      }

      const context: AutomationContext = {
        webhookPayload: payload,
        eventType,
        triggeredAt: new Date()
      };

      let processedRules = 0;
      const results = [];

      // Processar cada regra
      for (const rule of rules) {
        try {
          console.log(`[AutomationEngine] Processing rule: ${rule.name} (${rule.id})`);
          
          const startTime = Date.now();
          
          // Avaliar condições da regra
          const conditionsMet = await this.evaluateConditions(rule.conditions, context);
          
          if (conditionsMet) {
            console.log(`[AutomationEngine] Conditions met for rule: ${rule.name}`);
            
            // Executar ações da regra
            const actionResults = await this.executeActions(rule.actions, context, rule);
            
            const executionTime = Date.now() - startTime;
            
            // Log da execução
            await this.logRuleExecution(rule.id, context, actionResults, executionTime);
            
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: actionResults.success,
              actions: actionResults.results,
              executionTime
            });
            
            processedRules++;
          } else {
            console.log(`[AutomationEngine] Conditions not met for rule: ${rule.name}`);
          }
          
        } catch (ruleError) {
          console.error(`[AutomationEngine] Error processing rule ${rule.name}:`, ruleError);
          
          // Log do erro
          await this.logRuleExecution(rule.id, context, {
            success: false,
            error: ruleError.message,
            results: []
          }, 0);
          
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: ruleError.message
          });
        }
      }

      console.log(`[AutomationEngine] Processed ${processedRules} rules successfully`);
      
      return {
        success: true,
        processedRules,
        totalRules: rules.length,
        results
      };
      
    } catch (error) {
      console.error('[AutomationEngine] Fatal error processing webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Avalia se as condições de uma regra são atendidas
   */
  private static async evaluateConditions(conditions: any, context: AutomationContext): Promise<boolean> {
    if (!conditions || typeof conditions !== 'object') {
      return true; // Sem condições = sempre executar
    }

    // Se é um grupo de condições
    if ('conditions' in conditions && Array.isArray(conditions.conditions)) {
      return this.evaluateConditionGroup(conditions as ConditionGroup, context);
    }

    // Se é uma condição simples legada
    if (conditions.event_types && Array.isArray(conditions.event_types)) {
      return conditions.event_types.includes(context.eventType);
    }

    return true;
  }

  /**
   * Avalia um grupo de condições recursivamente
   */
  private static evaluateConditionGroup(group: ConditionGroup, context: AutomationContext): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return true;
    }

    const results = group.conditions.map(condition => {
      if ('conditions' in condition) {
        // É um subgrupo
        return this.evaluateConditionGroup(condition, context);
      } else {
        // É uma condição individual
        return this.evaluateCondition(condition, context);
      }
    });

    // Aplicar operador lógico
    return group.operator === 'AND' 
      ? results.every(result => result)
      : results.some(result => result);
  }

  /**
   * Avalia uma condição individual
   */
  private static evaluateCondition(condition: Condition, context: AutomationContext): boolean {
    const value = this.extractFieldValue(condition.field, context);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'not_contains':
        return !String(value).includes(String(condition.value));
      case 'starts_with':
        return String(value).startsWith(String(condition.value));
      case 'ends_with':
        return String(value).endsWith(String(condition.value));
      case 'empty':
        return !value || value === '' || value === null || value === undefined;
      case 'not_empty':
        return value && value !== '' && value !== null && value !== undefined;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'greater_equal':
        return Number(value) >= Number(condition.value);
      case 'less_equal':
        return Number(value) <= Number(condition.value);
      default:
        console.warn(`[AutomationEngine] Unknown operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Extrai valor de um campo do contexto usando notação de ponto
   */
  private static extractFieldValue(fieldPath: string, context: AutomationContext): any {
    if (fieldPath === 'event_type') {
      return context.eventType;
    }

    // Navegar pelo payload usando notação de ponto
    const parts = fieldPath.split('.');
    let value = context.webhookPayload;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Executa as ações de uma regra
   */
  private static async executeActions(actions: any[], context: AutomationContext, rule: any) {
    if (!actions || actions.length === 0) {
      return { success: true, results: [], message: 'No actions to execute' };
    }

    const results = [];
    let allSuccessful = true;

    // Ordenar ações por ordem
    const sortedActions = [...actions].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const action of sortedActions) {
      if (action.enabled === false) {
        continue;
      }

      try {
        console.log(`[AutomationEngine] Executing action: ${action.type}`);
        
        const actionResult = await this.executeAction(action, context, rule);
        results.push({
          type: action.type,
          success: actionResult.success,
          message: actionResult.message,
          ...('data' in actionResult && actionResult.data ? { data: actionResult.data } : {})
        });

        if (!actionResult.success) {
          allSuccessful = false;
        }
        
      } catch (actionError) {
        console.error(`[AutomationEngine] Error executing action ${action.type}:`, actionError);
        results.push({
          type: action.type,
          success: false,
          error: actionError.message
        });
        allSuccessful = false;
      }
    }

    return {
      success: allSuccessful,
      results,
      message: `Executed ${results.length} actions`
    };
  }

  /**
   * Executa uma ação específica
   */
  private static async executeAction(action: any, context: AutomationContext, rule: any) {
    switch (action.type) {
      case 'send_invite':
        return await this.executeSendInviteAction(action, context, rule);
      case 'send_email':
        return await this.executeSendEmailAction(action, context, rule);
      case 'send_whatsapp':
        return await this.executeSendWhatsAppAction(action, context, rule);
      case 'webhook_call':
        return await this.executeWebhookCallAction(action, context, rule);
      case 'update_profile':
        return await this.executeUpdateProfileAction(action, context, rule);
      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  }

  /**
   * Executa ação de envio de convite
   */
  private static async executeSendInviteAction(action: any, context: AutomationContext, rule: any) {
    try {
      const payload = context.webhookPayload;
      
      // Extrair dados do usuário do payload
      const userEmail = payload.customer?.email || payload.event?.userEmail || payload.email;
      const userName = payload.customer?.name || payload.event?.userName || payload.name;
      const userPhone = payload.customer?.phone || payload.event?.userPhone || payload.phone;
      const productId = payload.product_id || payload.event?.groupId || payload.product?.id;

      if (!userEmail) {
        return { success: false, message: 'No user email found in payload' };
      }

      // Determinar role baseado no mapeamento
      let roleId = action.parameters.role_id || 'default';
      
      if (action.parameters.role_mapping && productId) {
        roleId = action.parameters.role_mapping[productId] || action.parameters.role_mapping.default || roleId;
      }

      // Buscar role ID real
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', roleId)
        .single();

      if (!roleData) {
        return { success: false, message: `Role not found: ${roleId}` };
      }

      // Verificar se já existe convite
      const { data: existingInvite } = await supabase
        .from('invites')
        .select('id')
        .eq('email', userEmail)
        .eq('role_id', roleData.id)
        .is('used_at', null)
        .limit(1);

      if (existingInvite && existingInvite.length > 0) {
        return { success: true, message: 'Invite already exists for this user' };
      }

      // Gerar token
      const { data: token } = await supabase.rpc('generate_invite_token');
      if (!token) {
        return { success: false, message: 'Failed to generate invite token' };
      }

      // Encontrar criador admin
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      let creatorId = null;
      if (adminRole) {
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role_id', adminRole.id)
          .limit(1);
        creatorId = adminProfiles?.[0]?.id;
      }

      if (!creatorId) {
        return { success: false, message: 'No admin found to create invite' };
      }

      // Criar convite
      const inviteData = {
        email: userEmail,
        role_id: roleData.id,
        token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: creatorId,
        notes: `Convite automático - Regra: ${rule.name}`,
        whatsapp_number: userPhone,
        preferred_channel: userPhone ? 'both' : 'email'
      };

      const { data: newInvite, error } = await supabase
        .from('invites')
        .insert([inviteData])
        .select()
        .single();

      if (error) {
        return { success: false, message: `Failed to create invite: ${error.message}` };
      }

      // Processar envio se configurado
      if (action.parameters.auto_send) {
        try {
          await supabase.functions.invoke('process-invite', {
            body: { inviteId: newInvite.id }
          });
        } catch (sendError) {
          return {
            success: true,
            message: `Invite created but failed to send: ${sendError.message}`,
            data: { inviteId: newInvite.id }
          };
        }
      }

      return {
        success: true,
        message: `Invite created and sent to ${userEmail}`,
        data: { inviteId: newInvite.id, email: userEmail, role: roleId }
      };

    } catch (error) {
      return { success: false, message: `Send invite error: ${error.message}` };
    }
  }

  /**
   * Enviar email via Resend
   */
  private static async executeSendEmailAction(action: any, context: AutomationContext, rule: any) {
    try {
      const payload = context.webhookPayload;
      
      // Extrair dados do destinatário
      const recipientEmail = this.extractDynamicValue(action.parameters.recipient_email || 'payload.customer.email', context);
      const recipientName = this.extractDynamicValue(action.parameters.recipient_name || 'payload.customer.name', context);
      
      if (!recipientEmail) {
        return { success: false, message: 'No recipient email found' };
      }

      // Preparar corpo do email (suporta variáveis)
      const subject = this.replacePlaceholders(action.parameters.subject || 'Notificação', context);
      const body = this.replacePlaceholders(action.parameters.body || '', context);
      const template = action.parameters.template || 'default';

      // Enviar email via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipientEmail,
          toName: recipientName,
          subject,
          template,
          templateData: {
            ...context.webhookPayload,
            customBody: body
          }
        }
      });

      if (error) {
        return { success: false, message: `Failed to send email: ${error.message}` };
      }

      return {
        success: true,
        message: `Email sent to ${recipientEmail}`,
        data: { email: recipientEmail, subject }
      };

    } catch (error) {
      return { success: false, message: `Send email error: ${error.message}` };
    }
  }

  /**
   * Enviar mensagem via WhatsApp (Evolution API)
   */
  private static async executeSendWhatsAppAction(action: any, context: AutomationContext, rule: any) {
    try {
      const payload = context.webhookPayload;
      
      // Extrair número do WhatsApp
      const phoneNumber = this.extractDynamicValue(action.parameters.phone_number || 'payload.customer.phone', context);
      
      if (!phoneNumber) {
        return { success: false, message: 'No phone number found' };
      }

      // Preparar mensagem (suporta variáveis)
      const message = this.replacePlaceholders(action.parameters.message || '', context);
      const template = action.parameters.template;

      // Enviar via edge function
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phoneNumber,
          message,
          template,
          templateData: context.webhookPayload
        }
      });

      if (error) {
        return { success: false, message: `Failed to send WhatsApp: ${error.message}` };
      }

      return {
        success: true,
        message: `WhatsApp sent to ${phoneNumber}`,
        data: { phone: phoneNumber }
      };

    } catch (error) {
      return { success: false, message: `Send WhatsApp error: ${error.message}` };
    }
  }

  /**
   * Fazer chamada HTTP para webhook externo
   */
  private static async executeWebhookCallAction(action: any, context: AutomationContext, rule: any) {
    try {
      const url = action.parameters.url;
      const method = action.parameters.method || 'POST';
      const headers = action.parameters.headers || {};
      const timeout = action.parameters.timeout || 30;

      if (!url) {
        return { success: false, message: 'No webhook URL configured' };
      }

      // Preparar payload (pode incluir dados do contexto)
      const body = action.parameters.include_payload 
        ? JSON.stringify({
            ...action.parameters.custom_data,
            webhook_payload: context.webhookPayload,
            event_type: context.eventType,
            rule_id: rule.id,
            triggered_at: context.triggeredAt
          })
        : JSON.stringify(action.parameters.custom_data || {});

      // Fazer requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: method !== 'GET' ? body : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.text();
        
        if (!response.ok) {
          return {
            success: false,
            message: `Webhook returned status ${response.status}`,
            data: { status: response.status, response: responseData }
          };
        }

        return {
          success: true,
          message: `Webhook called successfully (${response.status})`,
          data: { status: response.status, response: responseData }
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return { success: false, message: `Webhook timeout after ${timeout}s` };
        }
        throw fetchError;
      }

    } catch (error) {
      return { success: false, message: `Webhook call error: ${error.message}` };
    }
  }

  /**
   * Atualizar perfil do usuário no banco
   */
  private static async executeUpdateProfileAction(action: any, context: AutomationContext, rule: any) {
    try {
      const payload = context.webhookPayload;
      
      // Identificar usuário (por email ou ID)
      const userEmail = this.extractDynamicValue(action.parameters.user_email || 'payload.customer.email', context);
      const userId = this.extractDynamicValue(action.parameters.user_id || 'payload.customer.id', context);

      if (!userEmail && !userId) {
        return { success: false, message: 'No user identifier found (email or ID)' };
      }

      // Buscar perfil do usuário
      let query = supabase.from('profiles').select('id, email');
      
      if (userId) {
        query = query.eq('id', userId);
      } else if (userEmail) {
        query = query.eq('email', userEmail);
      }

      const { data: profiles, error: fetchError } = await query.limit(1);

      if (fetchError || !profiles || profiles.length === 0) {
        return { success: false, message: `User profile not found: ${userEmail || userId}` };
      }

      const profile = profiles[0];

      // Preparar campos para atualização
      const updateFields: any = {};
      
      // Processar cada campo configurado
      if (action.parameters.fields) {
        for (const [fieldName, fieldConfig] of Object.entries(action.parameters.fields)) {
          const config = fieldConfig as any;
          
          if (config.value) {
            // Valor estático
            updateFields[fieldName] = config.value;
          } else if (config.source) {
            // Valor dinâmico do payload
            updateFields[fieldName] = this.extractDynamicValue(config.source, context);
          }
        }
      }

      if (Object.keys(updateFields).length === 0) {
        return { success: false, message: 'No fields configured for update' };
      }

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateFields)
        .eq('id', profile.id);

      if (updateError) {
        return { success: false, message: `Failed to update profile: ${updateError.message}` };
      }

      return {
        success: true,
        message: `Profile updated for ${userEmail || userId}`,
        data: { profileId: profile.id, updatedFields: Object.keys(updateFields) }
      };

    } catch (error) {
      return { success: false, message: `Update profile error: ${error.message}` };
    }
  }

  /**
   * Utilitário: Extrai valor dinâmico usando path notation
   */
  private static extractDynamicValue(path: string, context: AutomationContext): any {
    if (!path || typeof path !== 'string') return path;
    
    // Se não começa com 'payload.', retorna como está
    if (!path.startsWith('payload.')) return path;
    
    // Remove 'payload.' e usa extractFieldValue
    const fieldPath = path.replace('payload.', '');
    return this.extractFieldValue(fieldPath, context);
  }

  /**
   * Utilitário: Substitui placeholders no formato {{variavel}}
   */
  private static replacePlaceholders(text: string, context: AutomationContext): string {
    if (!text) return '';
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.extractDynamicValue(path.trim(), context);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Registra a execução de uma regra no log
   */
  private static async logRuleExecution(ruleId: string, context: AutomationContext, result: any, executionTime: number) {
    try {
      await supabase
        .from('automation_logs')
        .insert([{
          rule_id: ruleId,
          trigger_data: {
            event_type: context.eventType,
            payload: context.webhookPayload,
            triggered_at: context.triggeredAt
          },
          executed_actions: result.results || [],
          status: result.success ? 'success' : 'failed',
          error_message: result.error || null,
          execution_time_ms: executionTime
        }]);
    } catch (logError) {
      console.error('[AutomationEngine] Error logging rule execution:', logError);
    }
  }
}