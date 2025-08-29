
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { generateInviteUrl } from '@/utils/inviteValidationUtils';

export const useInviteCreate = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createInvite = async (
    email: string,
    roleId: string,
    notes?: string,
    expiresIn: string = '7 days',
    phone?: string,
    channelPreference: 'email' | 'whatsapp' | 'both' = 'email'
  ) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    const processStartTime = performance.now();
    try {
      setIsCreating(true);
      
      console.log("🚀 [INVITE-CREATE-TIMED] Iniciando criação:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone,
        startTime: new Date().toISOString()
      });

      // ETAPA 1: Criar convite na base de dados (TEMPORIZANDO)
      const dbStartTime = performance.now();
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_role_id: roleId,
        p_phone: phone,
        p_expires_in: `${expiresIn}`,
        p_notes: notes,
        p_channel_preference: channelPreference
      });
      const dbDuration = performance.now() - dbStartTime;

      console.log("⏱️ [TIMING-DB] Criação no banco:", {
        duration: `${Math.round(dbDuration)}ms`,
        success: !error
      });

      if (error) {
        console.error("❌ [INVITE-CREATE] Erro SQL:", error);
        throw error;
      }

      if (data.status === 'error') {
        console.error("❌ [INVITE-CREATE] Erro na função:", data.message);
        throw new Error(data.message);
      }

      const totalCreationTime = performance.now() - processStartTime;
      console.log("✅ [TIMING-TOTAL] Convite criado na DB:", {
        totalDuration: `${Math.round(totalCreationTime)}ms`,
        data: data
      });

      // FEEDBACK IMEDIATO ao usuário (removido daqui pois vem do modal)

      // ETAPA 2: Processar envio EM BACKGROUND (sem aguardar)
      processInviteDeliveryInBackground(data, email, roleId, phone, channelPreference, notes, processStartTime);

      return data;

    } catch (err: any) {
      console.error('❌ [INVITE-CREATE] Erro crítico:', err);
      toast.error('Erro ao criar convite', {
        description: err.message || 'Não foi possível criar o convite.'
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createInvite, isCreating };
};

// ========== PROCESSAMENTO EM BACKGROUND (OTIMIZADO) ==========

const processInviteDeliveryInBackground = async (
  inviteData: any,
  email: string,
  roleId: string,
  phone?: string,
  channelPreference: 'email' | 'whatsapp' | 'both' = 'email',
  notes?: string,
  processStartTime?: number
) => {
  // Não aguardar - processar em background
  setTimeout(async () => {
    const backgroundStartTime = performance.now();
    try {
      console.log("🚀 [BACKGROUND-DELIVERY-TIMED] Iniciando envio assíncrono:", {
        totalElapsed: processStartTime ? `${Math.round(performance.now() - processStartTime)}ms` : 'N/A',
        startTime: new Date().toISOString()
      });

      const inviteUrl = generateInviteUrl(inviteData.token);

      // Buscar role name (TEMPORIZANDO)
      const roleStartTime = performance.now();
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();
      const roleDuration = performance.now() - roleStartTime;

      console.log("⏱️ [TIMING-ROLE] Busca de role:", {
        duration: `${Math.round(roleDuration)}ms`,
        roleName: roleData?.name
      });

      // Usar sistema de envio otimizado
      const sendStartTime = performance.now();
      const sendResult = await sendInviteNotificationOptimized({
        email,
        phone,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: inviteData.expires_at,
        senderName: email.split('@')[0].replace(/[._-]/g, ' ').trim(),
        notes,
        inviteId: inviteData.invite_id,
        channelPreference
      });
      const sendDuration = performance.now() - sendStartTime;

      console.log("⏱️ [TIMING-SEND] Envio completo:", {
        duration: `${Math.round(sendDuration)}ms`,
        success: sendResult.success,
        method: sendResult.method
      });

      // 🎯 TOAST OTIMIZADO - Apenas resultado final com mais informações
      if (sendResult.success) {
        const totalTime = Math.round(performance.now() - processStartTime!);
        const methodEmoji = sendResult.method?.includes('email') ? '📧' : 
                           sendResult.method?.includes('whatsapp') ? '📱' : '📬';
        const channelText = sendResult.method === 'email+whatsapp' ? 'Email + WhatsApp' : 
                           sendResult.method?.includes('whatsapp') ? 'WhatsApp' : 'Email';
        
        toast.success(`${methodEmoji} Convite entregue com sucesso!`, {
          description: `✅ ${email} via ${channelText} (${totalTime}ms)`,
          duration: 4000
        });
      } else {
        // 🚨 IMPORTANTE: Salvar convite falhado para o filtro
        await saveFailedInvite(email, sendResult.error || 'Erro desconhecido', inviteData);
        
        toast.error('❌ Falha na entrega do convite', {
          description: `${email}: ${sendResult.error}`,
          duration: 6000,
          action: {
            label: "Ver Falhados",
            onClick: () => {
              // Trigger para abrir filtro de falhados (se disponível)
              console.log("🚨 Usuário clicou para ver convites falhados");
            }
          }
        });
      }

      const totalBackgroundTime = performance.now() - backgroundStartTime;
      console.log("⏱️ [TIMING-BACKGROUND] Processamento completo:", {
        totalDuration: `${Math.round(totalBackgroundTime)}ms`,
        success: sendResult.success
      });

    } catch (bgError: any) {
      console.error('❌ [BACKGROUND-DELIVERY] Erro:', bgError);
      
      // Salvar convite falhado
      await saveFailedInvite(email, bgError.message || 'Erro desconhecido no background', inviteData);
      
      toast.error('❌ Erro crítico no processamento', {
        description: `${email}: ${bgError.message}`,
        duration: 6000,
        action: {
          label: "Ver Falhados", 
          onClick: () => console.log("🚨 Abrir lista de falhados")
        }
      });
    }
  }, 50); // 50ms delay otimizado para resposta instantânea
};

// Sistema de envio OTIMIZADO com timeouts reduzidos
const sendInviteNotificationOptimized = async ({
  email,
  phone,
  inviteUrl,
  roleName,
  expiresAt,
  senderName,
  notes,
  inviteId,
  channelPreference
}: {
  email: string;
  phone?: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  channelPreference: 'email' | 'whatsapp' | 'both';
}): Promise<{ success: boolean; error?: string; method?: string }> => {
  try {
    console.log("📬 [INVITE-SEND] Enviando convite:", {
      email,
      channelPreference,
      hasPhone: !!phone,
      inviteUrl: inviteUrl.substring(0, 50) + "..."
    });

    // Validar URL antes de enviar
    if (!inviteUrl || !inviteUrl.includes('/convite/')) {
      throw new Error('URL de convite inválida');
    }

    // Usar sistema híbrido baseado na preferência de canal
    if (channelPreference === 'whatsapp' && phone) {
      // Enviar apenas via WhatsApp
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          email
        }
      });

      if (error) {
        console.error("❌ [INVITE-SEND] Erro na função WhatsApp:", error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Erro no envio via WhatsApp');
      }

      return {
        success: true,
        method: 'whatsapp'
      };
    } else if (channelPreference === 'both' && phone) {
      // Enviar via ambos os canais EM PARALELO com timeout individualizado
      console.log("🚀 [INVITE-SEND] Iniciando envios paralelos (email + WhatsApp)");

      const emailPromise = supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          forceResend: true
        }
      });

      const whatsappPromise = supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          email
        }
      });

      // Timeouts OTIMIZADOS: Email 5s, WhatsApp 8s (para cold start)
      const emailWithTimeout = Promise.race([
        emailPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout email (5s)')), 5000)
        )
      ]);

      const whatsappWithTimeout = Promise.race([
        whatsappPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout WhatsApp (8s)')), 8000)
        )
      ]);

      // Executar ambos em paralelo COM TIMING
      const parallelStartTime = performance.now();
      const results = await Promise.allSettled([emailWithTimeout, whatsappWithTimeout]);
      const parallelDuration = performance.now() - parallelStartTime;
      
      console.log("⏱️ [TIMING-PARALLEL] Execução paralela:", {
        duration: `${Math.round(parallelDuration)}ms`,
        emailStatus: results[0].status,
        whatsappStatus: results[1].status
      });
      
      const [emailResult, whatsappResult] = results;
      let emailSuccess = false;
      let whatsappSuccess = false;
      let errors: string[] = [];

      // Verificar resultado do email
      if (emailResult.status === 'fulfilled') {
        const { data: emailData, error: emailError } = emailResult.value as any;
        if (!emailError && emailData?.success) {
          emailSuccess = true;
          console.log("✅ [PARALLEL] Email enviado com sucesso");
        } else {
          errors.push(`Email: ${emailData?.error || emailError?.message || 'Falha no envio'}`);
          console.warn("⚠️ [PARALLEL] Falha no email:", emailData?.error || emailError?.message);
        }
      } else {
        errors.push(`Email: ${emailResult.reason?.message || 'Erro desconhecido'}`);
        console.warn("⚠️ [PARALLEL] Email rejeitado:", emailResult.reason?.message);
      }

      // Verificar resultado do WhatsApp
      if (whatsappResult.status === 'fulfilled') {
        const { data: whatsappData, error: whatsappError } = whatsappResult.value as any;
        if (!whatsappError && whatsappData?.success) {
          whatsappSuccess = true;
          console.log("✅ [PARALLEL] WhatsApp enviado com sucesso");
        } else {
          errors.push(`WhatsApp: ${whatsappData?.error || whatsappError?.message || 'Falha no envio'}`);
          console.warn("⚠️ [PARALLEL] Falha no WhatsApp:", whatsappData?.error || whatsappError?.message);
        }
      } else {
        errors.push(`WhatsApp: ${whatsappResult.reason?.message || 'Erro desconhecido'}`);
        console.warn("⚠️ [PARALLEL] WhatsApp rejeitado:", whatsappResult.reason?.message);
      }

      // Se ambos falharam, retornar erro
      if (!emailSuccess && !whatsappSuccess) {
        throw new Error(`Falha em ambos os canais: ${errors.join(', ')}`);
      }

      // Determinar método usado
      const method = emailSuccess && whatsappSuccess ? 'email+whatsapp' : 
                    emailSuccess ? 'email (WhatsApp falhou)' : 'whatsapp (Email falhou)';

      console.log(`✅ [PARALLEL] Envio concluído via: ${method}`);

      return {
        success: true,
        method
      };
    } else {
      // Enviar apenas via email (padrão)
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email,
          inviteUrl,
          roleName,
          expiresAt,
          senderName,
          notes,
          inviteId,
          forceResend: true
        }
      });

      if (error) {
        console.error("❌ [INVITE-SEND] Erro na edge function:", error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Erro no envio');
      }

      return {
        success: true,
        method: 'email'
      };
    }
  } catch (err: any) {
    console.error('❌ [INVITE-SEND] Erro no envio:', err);
    return {
      success: false,
      error: err.message || 'Erro desconhecido no envio'
    };
  }
};

// ========== SISTEMA DE TRACKING DE CONVITES FALHADOS ==========

const saveFailedInvite = async (email: string, errorMessage: string, inviteData?: any) => {
  try {
    console.log("💾 [FAILED-INVITE] Salvando convite falhado:", { email, errorMessage });
    
    if (!inviteData?.invite_id) {
      console.warn("⚠️ [FAILED-INVITE] Sem ID do convite, pulando salvamento");
      return;
    }
    
    // Primeiro buscar o valor atual, depois incrementar
    const { data: currentInvite } = await supabase
      .from('invites')
      .select('send_attempts')
      .eq('id', inviteData.invite_id)
      .single();
    
    const currentAttempts = currentInvite?.send_attempts || 0;
    
    // Atualizar o convite com status de falha
    const { error } = await supabase
      .from('invites')
      .update({
        delivery_status: 'failed',
        last_error: errorMessage,
        send_attempts: currentAttempts + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteData.invite_id);
    
    if (error) {
      console.error("❌ [FAILED-INVITE] Erro ao salvar:", error);
    } else {
      console.log("✅ [FAILED-INVITE] Status de falha salvo com sucesso");
    }
  } catch (err: any) {
    console.error("❌ [FAILED-INVITE] Erro crítico:", err);
  }
};
