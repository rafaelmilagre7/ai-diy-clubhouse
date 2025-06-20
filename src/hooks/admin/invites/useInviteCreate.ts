
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useInviteEmailService } from "./useInviteEmailService";

interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
  phone?: string;
  channelPreference?: 'email' | 'whatsapp' | 'both';
}

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'creating' | 'sending' | 'retrying' | 'complete'>('idle');
  const { toast } = useToast();
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();

  const createInvite = async ({ 
    email, 
    roleId, 
    notes, 
    expiresIn = '7 days',
    phone,
    channelPreference = 'email' 
  }: CreateInviteParams) => {
    try {
      setLoading(true);
      setCurrentStep('creating');

      console.log("🚀 Iniciando processo melhorado de convite:", {
        email,
        roleId,
        expiresIn,
        channelPreference
      });

      // ETAPA 1: Criar convite no banco de dados
      toast({
        title: "Criando convite...",
        description: "Gerando convite no sistema",
      });

      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email,
        p_phone: phone || null,
        p_role_id: roleId,
        p_expires_in: expiresIn,
        p_notes: notes || null,
        p_channel_preference: channelPreference
      });

      if (error) {
        console.error('❌ Erro na criação do convite:', error);
        throw new Error(error.message || 'Erro ao criar convite');
      }

      const result = data as any;
      
      if (result?.status === 'error') {
        const errorMessage = result.message || 'Erro desconhecido ao criar convite';
        console.error('❌ Erro retornado pela função:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!result?.invite_id || !result?.token) {
        console.error('❌ Resposta inválida da função:', result);
        throw new Error('Resposta inválida do servidor');
      }

      console.log("✅ Convite criado com sucesso:", {
        inviteId: result.invite_id,
        token: result.token,
        expiresAt: result.expires_at
      });

      // ETAPA 2: Preparar dados do email
      setCurrentStep('sending');
      
      toast({
        title: "Enviando email...",
        description: "Preparando e enviando convite por email",
      });

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('name')
        .eq('id', roleId)
        .single();

      if (roleError) {
        console.warn('⚠️ Não foi possível buscar nome do papel:', roleError);
      }

      const roleName = roleData?.name || 'Membro';
      const inviteUrl = getInviteLink(result.token);

      console.log("📧 Tentando enviar email:", {
        email,
        inviteUrl,
        roleName,
        expiresAt: result.expires_at
      });

      // ETAPA 3: Enviar email com retry automático
      let emailResult = await sendInviteEmail({
        email,
        inviteUrl,
        roleName,
        expiresAt: result.expires_at,
        notes,
        inviteId: result.invite_id,
        forceResend: true
      });

      // Se falhou na primeira tentativa, tentar novamente após 2 segundos
      if (!emailResult.success && !emailResult.error?.includes('invalid') && !emailResult.error?.includes('domain')) {
        console.log("⚠️ Primeira tentativa falhou, tentando novamente...");
        setCurrentStep('retrying');
        
        toast({
          title: "Tentando novamente...",
          description: "Primeira tentativa falhou, reenviando email",
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        emailResult = await sendInviteEmail({
          email,
          inviteUrl,
          roleName,
          expiresAt: result.expires_at,
          notes,
          inviteId: result.invite_id,
          forceResend: true
        });
      }

      // Registrar tentativa de envio independente do resultado
      await supabase.rpc('update_invite_send_attempt', {
        invite_id: result.invite_id
      });

      if (!emailResult.success) {
        console.error('❌ Falha definitiva no envio do email:', emailResult.error);
        
        const errorMsg = emailResult.error || 'Erro desconhecido no envio';
        let suggestion = 'Tente reenviar manualmente.';
        
        if (errorMsg.includes('domain')) {
          suggestion = 'Verifique se o domínio viverdeia.ai está validado no Resend.';
        } else if (errorMsg.includes('API')) {
          suggestion = 'Verifique a configuração da API key do Resend.';
        } else if (errorMsg.includes('timeout')) {
          suggestion = 'Problema de conectividade. Tente novamente em alguns minutos.';
        }

        toast({
          title: "Convite criado, mas email falhou",
          description: `${errorMsg}. ${suggestion}`,
          variant: "destructive",
          duration: 8000,
        });

        return {
          invite_id: result.invite_id,
          token: result.token,
          expires_at: result.expires_at,
          status: 'partial_success' as const,
          message: 'Convite criado mas email não foi enviado',
          email_sent: false,
          email_error: errorMsg,
          suggestion
        };
      }

      setCurrentStep('complete');

      toast({
        title: "Convite enviado com sucesso! ✅",
        description: `Convite para ${email} foi criado e enviado. Método: ${emailResult.strategy || 'Sistema principal'}`,
        duration: 6000,
      });

      console.log("🎉 Processo completo finalizado com sucesso:", {
        inviteId: result.invite_id,
        emailSent: true,
        emailStrategy: emailResult.strategy,
        emailId: emailResult.emailId
      });

      return {
        invite_id: result.invite_id,
        token: result.token,
        expires_at: result.expires_at,
        status: 'success' as const,
        message: 'Convite criado e enviado com sucesso',
        email_sent: true,
        email_strategy: emailResult.strategy,
        email_id: emailResult.emailId
      };

    } catch (error: any) {
      console.error('❌ Erro completo no processo de convite:', error);
      
      let errorMessage = "Ocorreu um erro inesperado";
      let isCreationError = true;
      
      if (error.message) {
        if (error.message.includes('permissão')) {
          errorMessage = "Você não tem permissão para criar convites";
        } else if (error.message.includes('email')) {
          errorMessage = "Email inválido ou já convidado";
        } else if (error.message.includes('role')) {
          errorMessage = "Papel de usuário inválido";
        } else if (error.message.includes('telefone') || error.message.includes('phone')) {
          errorMessage = "Telefone é obrigatório para envio via WhatsApp";
        } else if (error.message.includes('canal') || error.message.includes('channel')) {
          errorMessage = "Preferência de canal inválida";
        } else if (error.message.includes('interval')) {
          errorMessage = "Período de expiração inválido";
        } else if (error.message.includes('Email') || error.message.includes('smtp')) {
          errorMessage = `Erro no envio do email: ${error.message}`;
          isCreationError = false;
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: isCreationError ? "Erro ao criar convite" : "Erro no envio do email",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
      
      throw error;
    } finally {
      setLoading(false);
      setCurrentStep('idle');
    }
  };

  return { 
    createInvite, 
    loading,
    currentStep,
    isCreating: currentStep === 'creating',
    isSending: currentStep === 'sending',
    isRetrying: currentStep === 'retrying'
  };
};
