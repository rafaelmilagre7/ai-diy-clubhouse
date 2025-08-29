
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

    try {
      setIsCreating(true);
      
      console.log("📧 [INVITE-CREATE-OPTIMIZED] Criando convite:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone
      });

      // ETAPA 1: Criar convite na base de dados (resposta IMEDIATA)
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_role_id: roleId,
        p_phone: phone,
        p_expires_in: `${expiresIn}`,
        p_notes: notes,
        p_channel_preference: channelPreference
      });

      if (error) {
        console.error("❌ [INVITE-CREATE] Erro SQL:", error);
        throw error;
      }

      if (data.status === 'error') {
        console.error("❌ [INVITE-CREATE] Erro na função:", data.message);
        throw new Error(data.message);
      }

      console.log("✅ [INVITE-CREATE-OPTIMIZED] Convite criado na DB:", data);

      // FEEDBACK IMEDIATO ao usuário
      toast.success('Convite criado com sucesso!', {
        description: `Processando envio para ${email}...`
      });

      // ETAPA 2: Processar envio EM BACKGROUND (sem aguardar)
      processInviteDeliveryInBackground(data, email, roleId, phone, channelPreference, notes);

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
  notes?: string
) => {
  // Não aguardar - processar em background
  setTimeout(async () => {
    try {
      console.log("🚀 [BACKGROUND-DELIVERY] Iniciando envio assíncrono...");

      const inviteUrl = generateInviteUrl(inviteData.token);

      // Buscar role name (cache local se possível)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      // Usar sistema de envio otimizado
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

      // Toast de feedback após envio em background
      if (sendResult.success) {
        toast.success('📧 Convite enviado!', {
          description: `Enviado para ${email} via ${sendResult.method}`
        });
      } else {
        toast.warning('⚠️ Problema no envio', {
          description: sendResult.error || 'Tentaremos reenviar automaticamente'
        });
      }

    } catch (bgError: any) {
      console.error('❌ [BACKGROUND-DELIVERY] Erro:', bgError);
      toast.error('Erro no envio do convite', {
        description: 'Use a opção "Reenviar" se necessário'
      });
    }
  }, 100); // 100ms delay para não bloquear resposta
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

      // Timeout REDUZIDO para 3s (otimização)
      const emailWithTimeout = Promise.race([
        emailPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout email (3s)')), 3000)
        )
      ]);

      const whatsappWithTimeout = Promise.race([
        whatsappPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout WhatsApp (3s)')), 3000)
        )
      ]);

      // Executar ambos em paralelo
      const results = await Promise.allSettled([emailWithTimeout, whatsappWithTimeout]);
      
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
