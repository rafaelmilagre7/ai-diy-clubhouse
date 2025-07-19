
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface SessionSecurityOptions {
  maxIdleTime?: number; // em minutos
  checkInterval?: number; // em segundos
  autoLogoutWarning?: number; // em minutos antes do logout
}

/**
 * useSecureSession - Hook otimizado para segurança de sessão
 * 
 * MELHORIAS DA FASE 2:
 * - Menos agressivo nas verificações
 * - Melhor tratamento de erros
 * - Performance otimizada
 */
export const useSecureSession = (options: SessionSecurityOptions = {}) => {
  const {
    maxIdleTime = 60, // Aumentado para 60 minutos
    checkInterval = 300, // Verificar a cada 5 minutos
    autoLogoutWarning = 10 // Avisar 10 minutos antes
  } = options;

  const { user, signOut } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const validationInProgress = useRef(false);

  // Atualizar última atividade com throttling
  const updateActivity = useCallback(() => {
    const now = Date.now();
    // Throttling: só atualizar se passou mais de 30 segundos
    if (now - lastActivity > 30000) {
      setLastActivity(now);
      setWarningShown(false);
    }
  }, [lastActivity]);

  // Verificar se a sessão ainda é válida (otimizado)
  const validateSession = useCallback(async () => {
    if (!user || validationInProgress.current) return true;

    try {
      validationInProgress.current = true;
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('[SECURITY] Sessão inválida detectada');
        await signOut();
        return false;
      }

      // Verificar se o token não está próximo da expiração (com mais tempo de buffer)
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      
      if (expiresAt - now < 1800) { // 30 minutos para expirar
        console.info('[SECURITY] Token próximo da expiração, renovando...');
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn('[SECURITY] Erro ao renovar token:', refreshError.message);
            await signOut();
            return false;
          }
        } catch {
          await signOut();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[SECURITY] Erro na validação de sessão:', error);
      // Não fazer logout automático em caso de erro de rede
      return true;
    } finally {
      validationInProgress.current = false;
    }
  }, [user, signOut]);

  // Verificar inatividade (menos agressivo)
  const checkInactivity = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const inactiveMinutes = timeSinceActivity / (1000 * 60);

    // Mostrar aviso antes do logout automático
    if (inactiveMinutes >= (maxIdleTime - autoLogoutWarning) && !warningShown) {
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
    if (inactiveMinutes >= maxIdleTime) {
      console.warn('[SECURITY] Logout automático por inatividade');
      toast.error('Sessão expirada por inatividade');
      await signOut();
      return;
    }

    // Validar sessão apenas ocasionalmente
    if (inactiveMinutes < (maxIdleTime - autoLogoutWarning)) {
      await validateSession();
    }
  }, [user, lastActivity, maxIdleTime, autoLogoutWarning, warningShown, updateActivity, validateSession, signOut]);

  // Configurar listeners de atividade (menos eventos)
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [user, updateActivity]);

  // Configurar verificação periódica (menos frequente)
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(checkInactivity, checkInterval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, checkInactivity, checkInterval]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    lastActivity,
    updateActivity,
    validateSession,
    isInactive: user ? (Date.now() - lastActivity) / (1000 * 60) >= maxIdleTime : false
  };
};
