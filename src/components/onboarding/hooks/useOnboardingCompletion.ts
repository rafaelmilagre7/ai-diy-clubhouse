
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { useInviteAcceptance } from '@/hooks/useInviteAcceptance';
import { InviteTokenManager } from '@/utils/inviteTokenManager';

export const useOnboardingCompletion = () => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, refreshProfile } = useSimpleAuth();
  const { acceptInviteAndCompleteOnboarding } = useInviteAcceptance();

  const completeOnboarding = async (data: any, memberType: 'club' | 'formacao') => {
    const startTime = Date.now();
    setIsCompleting(true);
    setCompletionError(null);

    try {
      logger.info('[ONBOARDING-COMPLETION] 🚀 Iniciando finalização:', {
        memberType,
        hasInviteToken: !!data.inviteToken,
        userId: user?.id?.substring(0, 8) + '***',
        timestamp: new Date().toISOString()
      });

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // FLUXO DIFERENCIADO: Com convite vs sem convite
      if (data.inviteToken) {
        logger.info('[ONBOARDING-COMPLETION] 🎫 Fluxo com convite detectado');
        
        const result = await acceptInviteAndCompleteOnboarding({
          token: data.inviteToken,
          onboardingData: data
        });

        if (!result.success) {
          throw new Error(result.error || 'Erro ao aceitar convite');
        }

        // Sucesso - o hook de aceitação já faz o redirecionamento
        return;
      } else {
        // FLUXO NORMAL: Sem convite
        logger.info('[ONBOARDING-COMPLETION] 👤 Fluxo normal (sem convite)');

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: data.name || '',
            phone: data.phone || '',
            company: data.company || '',
            position: data.position || '',
            experience_level: data.experienceLevel || 'iniciante',
            main_objective: data.mainObjective || '',
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw new Error(`Erro ao salvar dados: ${updateError.message}`);
        }

        logger.info('[ONBOARDING-COMPLETION] ✅ Onboarding normal concluído:', {
          duration: `${Date.now() - startTime}ms`
        });

        // Atualizar contexto
        await refreshProfile();
        
        toast.success('Onboarding concluído com sucesso!');
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      }

    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Erro ao finalizar onboarding';
      
      logger.error('[ONBOARDING-COMPLETION] ❌ Erro na finalização:', {
        error: errorMessage,
        duration: `${duration}ms`,
        hasInviteToken: !!data.inviteToken
      });
      
      setCompletionError(errorMessage);
      toast.error(errorMessage);
      
      // Em caso de erro com convite, limpar token
      if (data.inviteToken) {
        InviteTokenManager.clearTokenOnError();
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeOnboarding,
    isCompleting,
    completionError
  };
};
