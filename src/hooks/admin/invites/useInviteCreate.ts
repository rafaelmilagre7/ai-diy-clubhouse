
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

  const createInviteWithFallback = async (params: CreateInviteParams): Promise<CreateInviteResponse | null> => {
    const requestId = crypto.randomUUID().substring(0, 8);
    
    try {
      setLoading(true);
      setCurrentStep('creating');

      console.log(`🎯 [${requestId}] Iniciando criação robusta de convite:`, {
        email: params.email,
        roleId: params.roleId,
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

      // FASE 1: Criar convite no banco SEMPRE (independente do email)
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
          created_by: (await supabase.auth.getUser()).data.user?.id,
          // Campos de controle para recuperação
          send_attempts: 0,
          email_provider: 'pending',
          last_sent_at: null
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

      console.log(`✅ [${requestId}] Convite criado com sucesso:`, {
        id: invite.id,
        token: invite.token
      });

      // FASE 2: Tentar enviar email (com sistema robusto de fallback)
      setCurrentStep('sending');
      toast.info("💫 Convite criado! Tentando enviar email...", { 
        description: "O convite já está salvo e pode ser reenviado se necessário" 
      });

      const inviteUrl = getInviteLink(invite.token);
      const roleName = invite.role?.name || 'Membro';

      let emailResult;
      try {
        // Tentativa de envio com timeout reduzido
        const emailPromise = sendInviteEmail({
          email: params.email,
          inviteUrl,
          roleName,
          expiresAt: invite.expires_at,
          notes: params.notes,
          inviteId: invite.id
        });

        // Timeout de 10 segundos para não travar a interface
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout no envio de email')), 10000)
        );

        emailResult = await Promise.race([emailPromise, timeoutPromise]) as any;
      } catch (emailError: any) {
        console.warn(`⚠️ [${requestId}] Falha no envio imediato:`, emailError.message);
        
        // Registrar tentativa falhada mas continuar
        await supabase
          .from('invites')
          .update({
            send_attempts: 1,
            email_provider: 'failed_immediate',
            last_sent_at: new Date().toISOString(),
            notes: (params.notes || '') + ` [Falha automática: ${emailError.message}]`
          })
          .eq('id', invite.id);

        // Criar resultado de fallback
        emailResult = {
          success: false,
          error: emailError.message,
          suggestion: 'Sistema de recuperação ativado. Use "Reenviar" ou vá para aba "Recuperação"'
        };
      }

      // FASE 3: Atualizar status baseado no resultado do email
      if (emailResult?.success) {
        await supabase
          .from('invites')
          .update({
            last_sent_at: new Date().toISOString(),
            send_attempts: 1,
            email_provider: emailResult.strategy || 'unknown',
            email_id: emailResult.emailId
          })
          .eq('id', invite.id);
      }

      setCurrentStep('complete');

      // FASE 4: Retornar resultado baseado no sucesso do email
      if (emailResult?.success) {
        console.log(`✅ [${requestId}] Convite criado e enviado com sucesso`);
        
        toast.success("🎉 Convite criado e enviado!", {
          description: `Email enviado para ${params.email} via ${emailResult.strategy || 'sistema principal'}`
        });
        
        return {
          status: 'success',
          message: `Convite enviado para ${params.email}`,
          invite,
          emailResult
        };
      } else {
        console.warn(`⚠️ [${requestId}] Convite criado mas email falhou:`, emailResult?.error);
        
        toast.warning("✅ Convite criado com ressalvas", {
          description: `Convite salvo mas email falhou: ${emailResult?.error || 'Erro desconhecido'}`,
          action: {
            label: "Ver Recuperação",
            onClick: () => {
              // Navegar para aba de recuperação seria ideal aqui
              console.log('Navegar para aba de recuperação');
            }
          }
        });
        
        return {
          status: 'partial_success',
          message: `Convite criado mas email falhou`,
          invite,
          suggestion: emailResult?.suggestion || 'Use o botão "Reenviar" ou acesse a aba "Recuperação" para tentar novamente'
        };
      }

    } catch (error: any) {
      console.error(`❌ [${requestId}] Erro crítico:`, error);
      
      toast.error("❌ Erro ao criar convite", {
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
    createInvite: createInviteWithFallback,
    loading,
    currentStep,
    isCreating,
    isSending,
    isRetrying
  };
};
