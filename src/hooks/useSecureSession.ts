
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
    maxIdleTime = 30, // 30 minutos de inatividade
    checkInterval = 60, // verificar a cada 60 segundos
    autoLogoutWarning = 5 // avisar 5 minutos antes
  } = options;

  const { user, signOut } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);

  // Verificar se a sessão ainda é válida
  const validateSession = useCallback(async () => {
    if (!user) return true;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('[SECURITY] Sessão inválida detectada');
        await signOut();
        return false;
      }

      // Verificar se o token não está próximo da expiração
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      
      if (expiresAt - now < 300) { // 5 minutos para expirar
        console.warn('[SECURITY] Token próximo da expiração');
        try {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
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
      await signOut();
      return false;
    }
  }, [user, signOut]);

  // Verificar inatividade
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

    // Validar sessão periodicamente
    await validateSession();
  }, [user, lastActivity, maxIdleTime, autoLogoutWarning, warningShown, updateActivity, validateSession, signOut]);

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

  // Configurar verificação periódica
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    lastActivity,
    updateActivity,
    validateSession,
    isInactive: user ? (Date.now() - lastActivity) / (1000 * 60) >= maxIdleTime : false
  };
};
