
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
        memberType,
        fromInvite: (data as any).fromInvite,
        inviteToken: (data as any).inviteToken
      });

      // 1. Atualizar perfil com dados do onboarding
      const profileUpdates = {
        name: data.name || '',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('[ONBOARDING-COMPLETION] Atualizando perfil:', profileUpdates);

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (profileError) {
        console.error('[ONBOARDING-COMPLETION] Erro ao atualizar perfil:', profileError);
        throw new Error(`Erro ao finalizar perfil: ${profileError.message}`);
      }

      console.log('[ONBOARDING-COMPLETION] Perfil atualizado com sucesso');

      // 2. Se veio de convite, tentar aceitar o convite agora
      if ((data as any).fromInvite && (data as any).inviteToken) {
        console.log('[ONBOARDING-COMPLETION] Processando convite...');
        
        try {
          const { data: inviteData, error: inviteError } = await supabase.rpc('accept_invite', {
            p_token: (data as any).inviteToken
          });

          if (inviteError) {
            console.error('[ONBOARDING-COMPLETION] Erro ao aceitar convite:', inviteError);
            // Não falhar aqui, apenas logar o erro
            console.warn('[ONBOARDING-COMPLETION] Continuando sem aceitar convite');
          } else {
            console.log('[ONBOARDING-COMPLETION] Convite aceito:', inviteData);
          }
        } catch (inviteError) {
          console.error('[ONBOARDING-COMPLETION] Exceção ao aceitar convite:', inviteError);
          // Não falhar aqui
        }
      }

      // 3. Recarregar perfil atualizado
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
        console.log('[ONBOARDING-COMPLETION] Perfil recarregado:', {
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

      // 4. Aguardar sincronização
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Navegação baseada no tipo de membro
      const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
      
      console.log('[ONBOARDING-COMPLETION] Redirecionando para:', redirectPath);
      
      navigate(redirectPath, { replace: true });

      return { success: true };

    } catch (error: any) {
      console.error('[ONBOARDING-COMPLETION] Erro crítico:', error);
      
      const errorMessage = error.message || 'Erro inesperado ao finalizar onboarding';
      setCompletionError(errorMessage);
      
      logger.error('Erro ao finalizar onboarding', error);
      
      toast.error(`Erro: ${errorMessage}`, {
        duration: 8000
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
