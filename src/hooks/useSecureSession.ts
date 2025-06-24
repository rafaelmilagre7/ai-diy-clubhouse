
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface SessionSecurityOptions {
  maxIdleTime?: number; // em minutos
  checkInterval?: number; // em segundos
  autoLogoutWarning?: number; // em minutos antes do logout
}

export const useSecureSession = (options: SessionSecurityOptions = {}) => {
  const {
    maxIdleTime = 120, // Aumentado para 2 horas em dev
    checkInterval = 300, // Verificar a cada 5 minutos em dev
    autoLogoutWarning = 15
  } = options;

  const { user, signOut } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const validationInProgress = useRef(false);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);

  // Verificação de sessão mais leve para desenvolvimento
  const validateSession = useCallback(async () => {
    if (!user || validationInProgress.current || import.meta.env.DEV) return true;

    try {
      validationInProgress.current = true;
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('[SECURITY] Sessão inválida detectada');
        await signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SECURITY] Erro na validação de sessão:', error);
      return true; // Não fazer logout automático em caso de erro de rede
    } finally {
      validationInProgress.current = false;
    }
  }, [user, signOut]);

  // Verificação de inatividade mais relaxada
  const checkInactivity = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const inactiveMinutes = timeSinceActivity / (1000 * 60);

    // Em desenvolvimento, ser mais permissivo
    const effectiveMaxIdle = import.meta.env.DEV ? maxIdleTime * 2 : maxIdleTime;

    // Mostrar aviso apenas em produção ou quando próximo do limite
    if (inactiveMinutes >= (effectiveMaxIdle - autoLogoutWarning) && !warningShown && !import.meta.env.DEV) {
      setWarningShown(true);
      toast.warning(
        `Sua sessão expirará em ${autoLogoutWarning} minutos por inatividade.`,
        {
          duration: autoLogoutWarning * 60 * 1000,
          action: {
            label: 'Continuar',
            onClick: updateActivity
          }
        }
      );
    }

    // Logout automático apenas se realmente necessário
    if (inactiveMinutes >= effectiveMaxIdle) {
      console.warn('[SECURITY] Logout automático por inatividade');
      if (!import.meta.env.DEV) {
        toast.error('Sessão expirada por inatividade');
      }
      await signOut();
      return;
    }

    // Validar sessão apenas em produção
    if (!import.meta.env.DEV) {
      await validateSession();
    }
  }, [user, lastActivity, maxIdleTime, autoLogoutWarning, warningShown, updateActivity, validateSession, signOut]);

  // Configurar listeners de atividade mais leves
  useEffect(() => {
    if (!user) return;

    // Menos eventos em desenvolvimento para reduzir overhead
    const events = import.meta.env.DEV 
      ? ['click', 'keypress'] 
      : ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const throttledUpdateActivity = (() => {
      let lastUpdate = 0;
      return () => {
        const now = Date.now();
        if (now - lastUpdate > 10000) { // Throttle para 10 segundos
          lastUpdate = now;
          updateActivity();
        }
      };
    })();
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
    };
  }, [user, updateActivity]);

  // Configurar verificação periódica mais relaxada
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Intervalo maior em desenvolvimento
    const effectiveInterval = import.meta.env.DEV ? checkInterval * 2 : checkInterval;
    intervalRef.current = setInterval(checkInactivity, effectiveInterval * 1000);

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
