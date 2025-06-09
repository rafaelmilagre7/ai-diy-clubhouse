
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { auditLogger } from '@/utils/auditLogger';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface SecureAuthOptions {
  sessionTimeout?: number; // em minutos
  autoLogoutWarning?: number; // em minutos antes do logout
  validateInterval?: number; // em segundos
}

export const useSecureAuth = (options: SecureAuthOptions = {}) => {
  const {
    sessionTimeout = 30, // 30 minutos padrão
    autoLogoutWarning = 5, // 5 minutos de aviso
    validateInterval = 60 // verificar a cada 60 segundos
  } = options;

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);

  // Limpeza completa do estado de autenticação
  const cleanupAuthState = useCallback(() => {
    // Remover todas as chaves relacionadas ao Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Limpar sessionStorage também
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });

    setUser(null);
    setSession(null);
    setWarningShown(false);
  }, []);

  // Logout seguro
  const secureSignOut = useCallback(async () => {
    try {
      logger.info("Iniciando logout seguro", {
        component: 'SECURE_AUTH',
        userId: user?.id?.substring(0, 8) + '***' || 'unknown'
      });

      // Log de auditoria
      if (user) {
        await auditLogger.logAuthEvent('logout', {
          userId: user.id.substring(0, 8) + '***',
          timestamp: new Date().toISOString()
        }, user.id);
      }

      // Limpeza do estado
      cleanupAuthState();

      // Logout do Supabase
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        // Continuar mesmo se falhar
        logger.warn("Erro no logout do Supabase, continuando", {
          component: 'SECURE_AUTH',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }

      // Redirecionar para login
      window.location.href = '/login';
      
    } catch (error) {
      logger.error("Erro no logout seguro", {
        component: 'SECURE_AUTH',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      // Forçar limpeza e redirecionamento mesmo com erro
      cleanupAuthState();
      window.location.href = '/login';
    }
  }, [user, cleanupAuthState]);

  // Validar integridade da sessão
  const validateSession = useCallback(async () => {
    if (!session) return false;

    try {
      // Verificar se a sessão ainda é válida
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        logger.warn("Sessão inválida detectada", {
          component: 'SECURE_AUTH',
          error: error?.message || 'Sessão não encontrada'
        });
        
        await auditLogger.logSecurityEvent('invalid_session_detected', 'medium', {
          sessionId: session.access_token?.substring(0, 16) + '***'
        });
        
        await secureSignOut();
        return false;
      }

      // Verificar expiração próxima
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = currentSession.expires_at || 0;
      
      if (expiresAt - now < 300) { // 5 minutos para expirar
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            logger.warn("Falha ao renovar sessão", {
              component: 'SECURE_AUTH',
              error: refreshError.message
            });
            await secureSignOut();
            return false;
          }
        } catch {
          await secureSignOut();
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error("Erro na validação de sessão", {
        component: 'SECURE_AUTH',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      await secureSignOut();
      return false;
    }
  }, [session, secureSignOut]);

  // Verificar inatividade
  const checkInactivity = useCallback(async () => {
    if (!user || !session) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const inactiveMinutes = timeSinceActivity / (1000 * 60);

    // Mostrar aviso antes do logout
    if (inactiveMinutes >= (sessionTimeout - autoLogoutWarning) && !warningShown) {
      setWarningShown(true);
      
      toast.warning(
        `Sua sessão expirará em ${autoLogoutWarning} minutos por inatividade. Clique aqui para continuar.`,
        {
          duration: autoLogoutWarning * 60 * 1000,
          action: {
            label: 'Continuar',
            onClick: updateActivity
          }
        }
      );
    }

    // Logout automático por inatividade
    if (inactiveMinutes >= sessionTimeout) {
      logger.warn("Logout automático por inatividade", {
        component: 'SECURE_AUTH',
        inactiveMinutes: Math.round(inactiveMinutes),
        userId: user.id?.substring(0, 8) + '***'
      });
      
      await auditLogger.logSecurityEvent('auto_logout_inactivity', 'low', {
        inactiveMinutes: Math.round(inactiveMinutes),
        sessionTimeout
      });
      
      toast.error('Sessão expirada por inatividade');
      await secureSignOut();
      return;
    }

    // Validar sessão periodicamente
    await validateSession();
  }, [user, session, lastActivity, sessionTimeout, autoLogoutWarning, warningShown, updateActivity, validateSession, secureSignOut]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user, updateActivity]);

  // Verificação periódica
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(checkInactivity, validateInterval * 1000);
    return () => clearInterval(interval);
  }, [user, session, checkInactivity, validateInterval]);

  // Configurar listener de estado de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          updateActivity();
          
          // Log de login bem-sucedido
          setTimeout(async () => {
            await auditLogger.logAuthEvent('session_start', {
              userId: session.user.id.substring(0, 8) + '***',
              timestamp: new Date().toISOString()
            }, session.user.id);
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        updateActivity();
      }
    });

    return () => subscription.unsubscribe();
  }, [updateActivity, cleanupAuthState]);

  return {
    user,
    session,
    lastActivity,
    updateActivity,
    validateSession,
    secureSignOut,
    cleanupAuthState,
    isInactive: user ? (Date.now() - lastActivity) / (1000 * 60) >= sessionTimeout : false
  };
};
