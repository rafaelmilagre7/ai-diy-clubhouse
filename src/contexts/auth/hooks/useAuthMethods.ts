
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { sanitizeForLogging } from '@/utils/securityUtils';
import { loginRateLimiter, getClientIdentifier } from '@/utils/rateLimiting';
import { useNavigate } from 'react-router-dom';

interface UseAuthMethodsProps {
  setIsLoading: (loading: boolean) => void;
}

export const useAuthMethods = ({ setIsLoading }: UseAuthMethodsProps) => {
  const navigate = useNavigate();

  // Função segura de limpeza de estado de autenticação
  const cleanupAuthState = useCallback(() => {
    try {
      // Remover tokens do localStorage
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('supabase.auth.') || key.includes('sb-')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Limpar sessionStorage se existir
      if (typeof sessionStorage !== 'undefined') {
        const sessionKeysToRemove = Object.keys(sessionStorage).filter(
          key => key.startsWith('supabase.auth.') || key.includes('sb-')
        );
        sessionKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key);
        });
      }
      
      logger.info("Estado de autenticação limpo com segurança", {
        component: 'AUTH_METHODS',
        clearedKeys: keysToRemove.length
      });
    } catch (error) {
      logger.warn("Erro ao limpar estado de autenticação", {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'AUTH_METHODS'
      });
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      const error = new Error('Email e senha são obrigatórios');
      toast.error(error.message);
      return { error };
    }

    // Verificar rate limiting
    const clientId = getClientIdentifier();
    const emailId = email.toLowerCase().trim();
    const rateLimitCheck = loginRateLimiter.canAttempt(`${clientId}_${emailId}`);
    
    if (!rateLimitCheck.allowed) {
      const error = new Error(rateLimitCheck.reason || 'Muitas tentativas de login');
      toast.error(error.message);
      logger.warn("Login bloqueado por rate limiting", {
        email: emailId.substring(0, 3) + '***',
        waitTime: rateLimitCheck.waitTime,
        component: 'AUTH_METHODS'
      });
      return { error };
    }

    setIsLoading(true);
    
    try {
      // Limpar estado anterior para evitar conflitos
      cleanupAuthState();
      
      // Tentar logout global primeiro (fallback)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {
        // Ignorar erro de logout se não houver sessão
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailId,
        password
      });

      if (error) {
        logger.warn("Erro no login", {
          error: sanitizeForLogging({ message: error.message }),
          component: 'AUTH_METHODS'
        });
        
        let friendlyMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Por favor, confirme seu email antes de fazer login';
        } else if (error.message.includes('Too many requests')) {
          friendlyMessage = 'Muitas tentativas. Tente novamente em alguns minutos';
        }
        
        toast.error(friendlyMessage);
        return { error };
      }

      if (data.user) {
        // Reset rate limiting após sucesso
        loginRateLimiter.reset(`${clientId}_${emailId}`);
        
        logger.info("Login realizado com sucesso", {
          userId: data.user.id.substring(0, 8) + '***',
          component: 'AUTH_METHODS'
        });
        
        toast.success('Login realizado com sucesso!');
        
        // Usar navigate ao invés de window.location.href para evitar refresh
        navigate('/dashboard', { replace: true });
      }

      return { error: undefined };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Erro desconhecido no login');
      
      logger.error("Erro crítico no login", {
        error: sanitizeForLogging({ message: authError.message }),
        component: 'AUTH_METHODS'
      });
      
      toast.error('Erro interno. Tente novamente mais tarde.');
      return { error: authError };
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, cleanupAuthState, navigate]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      logger.info("Iniciando logout", { component: 'AUTH_METHODS' });
      
      // Limpar estado de autenticação
      cleanupAuthState();
      
      // Tentar logout global
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        logger.warn("Erro no logout global", {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          component: 'AUTH_METHODS'
        });
      }
      
      toast.success('Logout realizado com sucesso');
      
      // Usar navigate ao invés de window.location.href
      navigate('/login', { replace: true });
      
      return { success: true, error: null };
      
    } catch (error) {
      logger.error("Erro crítico no logout", {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        component: 'AUTH_METHODS'
      });
      
      toast.error('Erro ao fazer logout. Redirecionando...');
      
      // Em caso de erro crítico, usar window.location como fallback
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
      return { success: false, error: error instanceof Error ? error : new Error('Erro desconhecido') };
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, cleanupAuthState, navigate]);

  // Método específico para login de membro (pode ter lógica adicional)
  const signInAsMember = useCallback(async (email: string, password: string) => {
    return signIn(email, password);
  }, [signIn]);

  // Método específico para login de admin (pode ter validações extras)
  const signInAsAdmin = useCallback(async (email: string, password: string) => {
    const result = await signIn(email, password);
    
    if (!result.error) {
      logger.info("Tentativa de login como admin", {
        component: 'AUTH_METHODS'
      });
    }
    
    return result;
  }, [signIn]);

  return {
    signIn,
    signOut,
    signInAsMember,
    signInAsAdmin
  };
};
