import { useCallback, useRef } from 'react';
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
  const cacheRef = useRef<{[key: string]: any}>({});
  const isRedirectingRef = useRef(false);

  const redirectToNextStep = useCallback(async (replace: boolean = true) => {
    if (!user?.id) {
      console.warn('🚫 [ONBOARDING-REDIRECT] Usuário não identificado');
      navigate('/login', { replace });
      return;
    }

    // Prevenir múltiplos redirecionamentos simultâneos
    if (isRedirectingRef.current) {
      console.warn('🔄 [ONBOARDING-REDIRECT] Redirecionamento já em andamento, ignorando...');
      return;
    }

    // Verificar cache primeiro (válido por 5 segundos)
    const cacheKey = `onboarding_${user.id}`;
    const cachedData = cacheRef.current[cacheKey];
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < 5000) {
      console.log('🎯 [ONBOARDING-REDIRECT] Usando dados do cache:', cachedData.data);
      if (cachedData.data?.redirect_url) {
        navigate(cachedData.data.redirect_url, { replace });
      } else {
        navigate('/dashboard', { replace });
      }
      return;
    }

    isRedirectingRef.current = true;
    console.log('🔍 [ONBOARDING-REDIRECT] Determinando próximo passo para:', user.id);

    try {
      // Timeout de 3 segundos para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const dataPromise = supabase.rpc('get_onboarding_next_step', {
        p_user_id: user.id
      });

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ [ONBOARDING-REDIRECT] Erro ao determinar próximo passo:', error);
        navigate('/dashboard', { replace });
        return;
      }

      console.log('✅ [ONBOARDING-REDIRECT] Próximo passo determinado:', data);

      // Salvar no cache
      cacheRef.current[cacheKey] = {
        data,
        timestamp: now
      };

      if (data?.redirect_url) {
        navigate(data.redirect_url, { replace });
      } else {
        console.warn('⚠️ [ONBOARDING-REDIRECT] Sem URL de redirecionamento, indo para dashboard');
        navigate('/dashboard', { replace });
      }
    } catch (error) {
      console.error('❌ [ONBOARDING-REDIRECT] Erro inesperado:', error);
      navigate('/dashboard', { replace });
    } finally {
      // Reset do flag após 1 segundo
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 1000);
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