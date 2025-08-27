
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
      
      console.log("📧 [INVITE-CREATE] Criando convite:", {
        email,
        roleId,
        channelPreference,
        hasPhone: !!phone
      });

      // Usar a função híbrida que suporta diferentes canais
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

      console.log("✅ [INVITE-CREATE] Convite criado:", data);

      // Gerar URL padronizada  
      const inviteUrl = generateInviteUrl(data.token);
      
      console.log("📤 [INVITE-CREATE] Iniciando envio em paralelo...");
      
      // Buscar nome do papel para o envio
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      // Enviar convite via email/WhatsApp (otimizado para resposta rápida)
      const sendResult = await sendInviteNotification({
        email,
        phone,
        inviteUrl,
        roleName: roleData?.name || 'membro',
        expiresAt: data.expires_at,
        senderName: email.split('@')[0].replace(/[._-]/g, ' ').trim(),
        notes,
        inviteId: data.invite_id,
        channelPreference
      });

      if (!sendResult.success) {
        console.warn("⚠️ [INVITE-CREATE] Problema no envio:", sendResult.error);
        toast.warning('Convite criado, mas houve um problema no envio', {
          description: sendResult.error || 'O sistema tentará reenviar automaticamente.'
        });
      } else {
        console.log("✅ [INVITE-CREATE] Envio bem-sucedido:", sendResult.method);
        toast.success('Convite criado e enviado com sucesso', {
          description: `Convite para ${email} foi enviado via ${sendResult.method}.`
        });
      }

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

// Função auxiliar para envio de notificações
const sendInviteNotification = async ({
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
      // Enviar via ambos os canais
      let emailSuccess = false;
      let whatsappSuccess = false;
      let lastError = '';

      // Tentar email primeiro
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
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

        if (!emailError && emailData.success) {
          emailSuccess = true;
        } else {
          lastError += `Email: ${emailData?.error || emailError?.message || 'Erro desconhecido'}; `;
        }
      } catch (err: any) {
        lastError += `Email: ${err.message}; `;
      }

      // Tentar WhatsApp
      try {
        console.log("📱 [DEBUG] Iniciando chamada WhatsApp com dados:", {
          phone,
          inviteUrl: inviteUrl.substring(0, 50) + "...",
          roleName,
          email
        });

        const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-invite', {
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

        console.log("📱 [DEBUG] Resposta WhatsApp:", { 
          data: whatsappData, 
          error: whatsappError,
          hasData: !!whatsappData,
          hasError: !!whatsappError 
        });

        if (!whatsappError && whatsappData.success) {
          whatsappSuccess = true;
          console.log("✅ [DEBUG] WhatsApp enviado com sucesso!");
        } else {
          console.error("❌ [DEBUG] Erro no WhatsApp:", whatsappData?.error || whatsappError?.message);
          lastError += `WhatsApp: ${whatsappData?.error || whatsappError?.message || 'Erro desconhecido'}`;
        }
      } catch (err: any) {
        console.error("❌ [DEBUG] Exceção no WhatsApp:", err);
        lastError += `WhatsApp: ${err.message}`;
      }

      if (!emailSuccess && !whatsappSuccess) {
        throw new Error(`Falha em ambos os canais: ${lastError}`);
      }

      return {
        success: true,
        method: emailSuccess && whatsappSuccess ? 'email+whatsapp' : 
                emailSuccess ? 'email' : 'whatsapp'
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
