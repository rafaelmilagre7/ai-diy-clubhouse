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
          data: actionResult.data
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
   * Outras ações - implementação básica
   */
  private static async executeSendEmailAction(action: any, context: AutomationContext, rule: any) {
    // TODO: Implementar envio de email
    return { success: true, message: 'Email action executed (not implemented)', data: {} };
  }

  private static async executeSendWhatsAppAction(action: any, context: AutomationContext, rule: any) {
    // TODO: Implementar envio de WhatsApp
    return { success: true, message: 'WhatsApp action executed (not implemented)', data: {} };
  }

  private static async executeWebhookCallAction(action: any, context: AutomationContext, rule: any) {
    // TODO: Implementar chamada de webhook
    return { success: true, message: 'Webhook call action executed (not implemented)', data: {} };
  }

  private static async executeUpdateProfileAction(action: any, context: AutomationContext, rule: any) {
    // TODO: Implementar atualização de perfil
    return { success: true, message: 'Update profile action executed (not implemented)', data: {} };
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