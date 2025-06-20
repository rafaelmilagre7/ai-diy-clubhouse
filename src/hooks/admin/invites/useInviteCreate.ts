
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
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      setLoading(true);
      setCurrentStep('creating');

      console.log(`🎯 [${requestId}] Iniciando criação de convite:`, {
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
        console.error(`❌ [${requestId}] Validação falhou:`, errorMsg);
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

      console.log(`📅 [${requestId}] Data de expiração:`, expiresAt.toISOString());

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
        console.error(`❌ [${requestId}] Erro ao criar convite:`, createError);
        throw new Error(createError?.message || 'Falha ao criar convite');
      }

      console.log(`✅ [${requestId}] Convite criado:`, {
        id: invite.id,
        token: invite.token,
        expiresAt: invite.expires_at
      });

      // Atualizar progresso
      setCurrentStep('sending');

      // Gerar link do convite
      const inviteUrl = getInviteLink(invite.token);
      const roleName = invite.role?.name || 'Membro';

      console.log(`🔗 [${requestId}] Link gerado:`, inviteUrl);

      // Enviar email com sistema robusto
      const emailResult = await sendInviteEmail({
        email: params.email,
        inviteUrl,
        roleName,
        expiresAt: invite.expires_at,
        notes: params.notes,
        inviteId: invite.id
      });

      // Atualizar convite com informações do envio
      await supabase
        .from('invites')
        .update({
          last_sent_at: new Date().toISOString(),
          send_attempts: 1,
          email_provider: emailResult.strategy || 'unknown',
          email_id: emailResult.emailId
        })
        .eq('id', invite.id);

      setCurrentStep('complete');

      if (emailResult.success) {
        console.log(`✅ [${requestId}] Convite criado e enviado com sucesso`);
        
        return {
          status: 'success',
          message: `Convite enviado para ${params.email}`,
          invite,
          emailResult
        };
      } else {
        console.warn(`⚠️ [${requestId}] Convite criado mas email falhou:`, emailResult.error);
        
        return {
          status: 'partial_success',
          message: `Convite criado para ${params.email}`,
          invite,
          suggestion: emailResult.suggestion || 'Use o botão "Reenviar" para tentar novamente.'
        };
      }

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erro crítico:`, error);
      
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
