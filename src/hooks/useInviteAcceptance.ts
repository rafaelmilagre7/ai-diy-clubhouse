
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

interface AcceptInviteParams {
  token: string;
  onboardingData: any;
}

export const useInviteAcceptance = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const navigate = useNavigate();

  const acceptInviteAndCompleteOnboarding = async ({ token, onboardingData }: AcceptInviteParams) => {
    const startTime = Date.now();
    setIsAccepting(true);

    try {
      logger.info('[INVITE-ACCEPTANCE] 🎯 Iniciando aceitação de convite:', {
        token: token.substring(0, 8) + '***',
        hasData: !!onboardingData,
        timestamp: new Date().toISOString()
      });

      // 1. Aceitar o convite
      logger.info('[INVITE-ACCEPTANCE] 📋 Executando RPC accept_invite...');
      const { data: acceptResult, error: acceptError } = await supabase.rpc('accept_invite', {
        p_token: token
      });

      if (acceptError) {
        throw new Error(`Erro ao aceitar convite: ${acceptError.message}`);
      }

      if (!acceptResult?.success) {
        throw new Error(acceptResult?.message || 'Falha ao aceitar convite');
      }

      logger.info('[INVITE-ACCEPTANCE] ✅ Convite aceito com sucesso:', {
        requiresOnboarding: acceptResult.requires_onboarding,
        duration: `${Date.now() - startTime}ms`
      });

      // 2. Atualizar dados do perfil com informações do onboarding
      logger.info('[INVITE-ACCEPTANCE] 📝 Atualizando perfil com dados do onboarding...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: onboardingData.name || '',
          phone: onboardingData.phone || '',
          company: onboardingData.company || '',
          position: onboardingData.position || '',
          experience_level: onboardingData.experienceLevel || 'iniciante',
          main_objective: onboardingData.mainObjective || '',
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (updateError) {
        logger.error('[INVITE-ACCEPTANCE] ❌ Erro ao atualizar perfil:', updateError);
        throw new Error(`Erro ao salvar dados: ${updateError.message}`);
      }

      logger.info('[INVITE-ACCEPTANCE] 💾 Perfil atualizado com sucesso');

      // 3. Limpar token e cache
      InviteTokenManager.clearTokenOnSuccess();
      
      // 4. Mostrar sucesso e redirecionar
      const totalDuration = Date.now() - startTime;
      logger.info('[INVITE-ACCEPTANCE] 🎉 Processo completo:', {
        totalDuration: `${totalDuration}ms`,
        redirecting: true
      });

      toast.success('Bem-vindo(a) ao Viver de IA! Seu onboarding foi concluído com sucesso.');
      
      // Aguardar um pouco para o toast aparecer, então redirecionar
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

      return { success: true };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('[INVITE-ACCEPTANCE] 💥 Erro no processo:', {
        error: error.message,
        duration: `${duration}ms`
      });
      
      toast.error(`Erro ao finalizar: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    acceptInviteAndCompleteOnboarding,
    isAccepting
  };
};
