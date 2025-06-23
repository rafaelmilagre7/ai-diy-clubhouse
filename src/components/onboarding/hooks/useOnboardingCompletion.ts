
import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { OnboardingData } from '../types/onboardingTypes';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

export const useOnboardingCompletion = () => {
  const { user, setProfile } = useAuth();
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const completeOnboarding = useCallback(async (
    data: OnboardingData,
    memberType: 'club' | 'formacao'
  ) => {
    if (!user?.id) {
      throw new Error('Usuário não encontrado');
    }

    setIsCompleting(true);
    setCompletionError(null);

    try {
      console.log('[ONBOARDING-COMPLETION] Iniciando finalização:', { 
        userId: user.id, 
        memberType 
      });

      // 1. Marcar onboarding como completado no perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[ONBOARDING-COMPLETION] Erro ao atualizar perfil:', profileError);
        throw new Error(`Erro ao finalizar: ${profileError.message}`);
      }

      // 2. Recarregar perfil atualizado
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:role_id (
            id,
            name,
            description,
            permissions,
            is_system
          )
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.warn('[ONBOARDING-COMPLETION] Aviso ao recarregar perfil:', fetchError);
      } else if (updatedProfile) {
        console.log('[ONBOARDING-COMPLETION] Perfil atualizado:', {
          onboardingCompleted: updatedProfile.onboarding_completed,
          role: updatedProfile.user_roles?.name
        });
        
        setProfile({
          ...updatedProfile as any,
          email: updatedProfile.email || user.email || '',
        } as any);
      }

      logger.info('Onboarding concluído com sucesso', {
        component: 'OnboardingCompletion',
        userId: user.id,
        memberType
      });

      toast.success('Onboarding concluído! Bem-vindo à plataforma.', {
        duration: 3000
      });

      // 3. Aguardar um momento para sincronização
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Navegação robusta baseada no tipo de membro
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      
      console.log('[ONBOARDING-COMPLETION] Redirecionando para:', redirectPath);
      
      // Usar replace para evitar voltar ao onboarding
      navigate(redirectPath, { replace: true });

      return { success: true };

    } catch (error: any) {
      console.error('[ONBOARDING-COMPLETION] Erro crítico:', error);
      
      const errorMessage = error.message || 'Erro inesperado ao finalizar onboarding';
      setCompletionError(errorMessage);
      
      logger.error('Erro ao finalizar onboarding', error, {
        component: 'OnboardingCompletion',
        userId: user.id,
        memberType
      });
      
      toast.error(`Erro: ${errorMessage}`, {
        duration: 5000
      });

      throw error;
    } finally {
      setIsCompleting(false);
    }
  }, [user, setProfile, navigate]);

  return {
    completeOnboarding,
    isCompleting,
    completionError
  };
};
