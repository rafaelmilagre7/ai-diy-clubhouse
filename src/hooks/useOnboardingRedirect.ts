import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook centralizado para redirecionamento de onboarding
 * Usa a função get_onboarding_next_step do banco para determinar redirecionamento
 */
export const useOnboardingRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const redirectToNextStep = useCallback(async (replace: boolean = true) => {
    if (!user?.id) {
      console.warn('🚫 [ONBOARDING-REDIRECT] Usuário não identificado');
      navigate('/login', { replace });
      return;
    }

    console.log('🔍 [ONBOARDING-REDIRECT] Determinando próximo passo para:', user.id);

    try {
      const { data, error } = await supabase.rpc('get_onboarding_next_step', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ [ONBOARDING-REDIRECT] Erro ao determinar próximo passo:', error);
        navigate('/dashboard', { replace });
        return;
      }

      console.log('✅ [ONBOARDING-REDIRECT] Próximo passo determinado:', data);

      if (data?.redirect_url) {
        navigate(data.redirect_url, { replace });
      } else {
        console.warn('⚠️ [ONBOARDING-REDIRECT] Sem URL de redirecionamento, indo para dashboard');
        navigate('/dashboard', { replace });
      }
    } catch (error) {
      console.error('❌ [ONBOARDING-REDIRECT] Erro inesperado:', error);
      navigate('/dashboard', { replace });
    }
  }, [user?.id, navigate]);

  const validateAndRedirect = useCallback(async (targetPath: string, replace: boolean = true) => {
    if (!user?.id) {
      console.warn('🚫 [ONBOARDING-REDIRECT] Usuário não identificado para validação');
      navigate('/login', { replace });
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('get_onboarding_next_step', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ [ONBOARDING-REDIRECT] Erro na validação:', error);
        return false;
      }

      // Se onboarding está completo, permitir acesso a qualquer path
      if (data?.is_completed) {
        console.log('✅ [ONBOARDING-REDIRECT] Onboarding completo, permitindo acesso a:', targetPath);
        return true;
      }

      // Se o targetPath corresponde ao próximo passo correto, permitir
      if (data?.redirect_url === targetPath) {
        console.log('✅ [ONBOARDING-REDIRECT] Path corresponde ao próximo passo:', targetPath);
        return true;
      }

      // Caso contrário, redirecionar para o passo correto
      console.log('🔄 [ONBOARDING-REDIRECT] Path incorreto, redirecionando de', targetPath, 'para', data?.redirect_url);
      if (data?.redirect_url) {
        navigate(data.redirect_url, { replace });
      }
      return false;
    } catch (error) {
      console.error('❌ [ONBOARDING-REDIRECT] Erro na validação:', error);
      return false;
    }
  }, [user?.id, navigate]);

  return {
    redirectToNextStep,
    validateAndRedirect
  };
};