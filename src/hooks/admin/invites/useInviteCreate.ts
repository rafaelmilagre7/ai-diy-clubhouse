
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInviteEmailService } from './useInviteEmailService';
import { useInviteValidation } from './useInviteValidation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { CreateInviteParams, CreateInviteResponse } from './types';

type CurrentStep = 'idle' | 'creating' | 'sending' | 'retrying' | 'complete';

export const useInviteCreate = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep>('idle');
  const { toast: uiToast } = useToast();
  const { sendInviteEmail, getInviteLink } = useInviteEmailService();
  const { validateInviteData } = useInviteValidation();

  const createInvite = async (params: CreateInviteParams): Promise<CreateInviteResponse | null> => {
    try {
      setLoading(true);
      setCurrentStep('creating');

      console.log("🎯 Iniciando criação de convite com parâmetros:", {
        email: params.email,
        roleId: params.roleId,
        expiresIn: params.expiresIn,
        channelPreference: params.channelPreference
      });

      // Validação dos dados
      const validation = validateInviteData(params.email, params.roleId, {
        phone: params.phone,
        channelPreference: params.channelPreference,
        expiresIn: params.expiresIn
      });

      if (!validation.isValid) {
        const errorMsg = validation.errors.join(', ');
        toast.error("Dados inválidos", { description: errorMsg });
        return null;
      }

      // Mostrar avisos se houver
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast.warning("Atenção", { description: warning });
        });
      }

      // Calcular data de expiração
      const expiresAt = new Date();
      const daysToAdd = {
        '1 day': 1,
        '3 days': 3, 
        '7 days': 7,
        '14 days': 14,
        '30 days': 30
      }[params.expiresIn || '7 days'] || 7;
      
      expiresAt.setDate(expiresAt.getDate() + daysToAdd);

      console.log("📅 Data de expiração calculada:", expiresAt.toISOString());

      // Criar convite no banco
      const { data: invite, error: createError } = await supabase
        .from('invites')
        .insert({
          email: params.email,
          phone: params.phone,
          role_id: params.roleId,
          token: crypto.randomUUID(),
          expires_at: expiresAt.toISOString(),
          notes: params.notes,
          channel_preference: params.channelPreference || 'email',
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          role:role_id(name)
        `)
        .single();

      if (createError || !invite) {
        console.error("❌ Erro ao criar convite:", createError);
        throw new Error(createError?.message || 'Falha ao criar convite');
      }

      console.log("✅ Convite criado no banco:", {
        id: invite.id,
        token: invite.token,
        expiresAt: invite.expires_at
      });

      // Atualizar progresso
      setCurrentStep('sending');

      // Gerar link do convite
      const inviteUrl = getInviteLink(invite.token);
      const roleName = invite.role?.name || 'Membro';

      console.log("🔗 Link do convite gerado:", inviteUrl);

      // Tentar enviar email
      let emailResult;
      let maxRetries = 2;
      let currentRetry = 0;

      while (currentRetry < maxRetries) {
        try {
          if (currentRetry > 0) {
            setCurrentStep('retrying');
            console.log(`🔄 Tentativa ${currentRetry + 1} de ${maxRetries}...`);
            
            // Aguardar um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 1000 * currentRetry));
          }

          emailResult = await sendInviteEmail({
            email: params.email,
            inviteUrl,
            roleName,
            expiresAt: invite.expires_at,
            notes: params.notes,
            inviteId: invite.id,
            forceResend: currentRetry > 0
          });

          if (emailResult.success) {
            console.log("✅ Email enviado com sucesso!");
            break;
          } else {
            console.log(`⚠️ Tentativa ${currentRetry + 1} falhou:`, emailResult.error);
            currentRetry++;
          }
        } catch (error: any) {
          console.error(`❌ Erro na tentativa ${currentRetry + 1}:`, error);
          currentRetry++;
        }
      }

      // Atualizar convite com informações do envio
      if (emailResult?.success) {
        await supabase
          .from('invites')
          .update({
            last_sent_at: new Date().toISOString(),
            send_attempts: currentRetry + 1,
            email_provider: 'resend',
            email_id: emailResult.emailId
          })
          .eq('id', invite.id);

        setCurrentStep('complete');

        return {
          status: 'success',
          message: `Convite enviado para ${params.email}`,
          invite,
          emailResult
        };
      } else {
        // Email falhou, mas convite foi criado
        await supabase
          .from('invites')
          .update({
            send_attempts: maxRetries,
            last_sent_at: new Date().toISOString()
          })
          .eq('id', invite.id);

        return {
          status: 'partial_success',
          message: `Convite criado para ${params.email}`,
          invite,
          suggestion: 'Email não foi enviado automaticamente. Use o botão "Reenviar" para tentar novamente.'
        };
      }

    } catch (error: any) {
      console.error('❌ Erro crítico ao criar convite:', error);
      
      toast.error("Erro ao criar convite", {
        description: error.message || 'Erro inesperado ao processar convite'
      });

      return null;
    } finally {
      setLoading(false);
      setCurrentStep('idle');
    }
  };

  const isCreating = currentStep === 'creating';
  const isSending = currentStep === 'sending';
  const isRetrying = currentStep === 'retrying';

  return {
    createInvite,
    loading,
    currentStep,
    isCreating,
    isSending,
    isRetrying
  };
};
