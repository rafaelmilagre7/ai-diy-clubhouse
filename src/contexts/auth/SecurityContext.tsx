
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecureSession } from '@/hooks/useSecureSession';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface SecurityContextType {
  lastActivity: number;
  updateActivity: () => void;
  validateSession: () => Promise<boolean>;
  isInactive: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const secureSession = useSecureSession({
    maxIdleTime: 30, // 30 minutos
    checkInterval: 30, // verificar a cada 30 segundos
    autoLogoutWarning: 5 // avisar 5 minutos antes
  });

  // Log de eventos de segurança (sem dados sensíveis)
  useEffect(() => {
    if (!user) return;

    const logSecurityEvent = async (eventType: string) => {
      try {
        await supabase.from('analytics').insert({
          user_id: user.id,
          event_type: `security_${eventType}`,
          event_data: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent.substring(0, 100), // Limitado para privacidade
            url: window.location.pathname // Apenas o path, sem query params
          }
        });
      } catch (error) {
        console.error('[SECURITY] Erro ao registrar evento:', error);
      }
    };

    // Log de início de sessão segura
    logSecurityEvent('session_start');

    // Detectar tentativas de manipulação do console
    const originalConsole = { ...console };
    let consoleWarningShown = false;

    Object.keys(console).forEach(key => {
      const original = console[key as keyof Console];
      if (typeof original === 'function') {
        (console as any)[key] = (...args: any[]) => {
          if (!consoleWarningShown && process.env.NODE_ENV === 'production') {
            consoleWarningShown = true;
            original.warn('[SECURITY] Detectada atividade no console em produção');
            logSecurityEvent('console_access');
          }
          return original.apply(console, args);
        };
      }
    });

    return () => {
      // Restaurar console original
      Object.assign(console, originalConsole);
    };
  }, [user]);

  // Detectar DevTools abertas
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    let devToolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          console.warn('[SECURITY] DevTools detectadas');
        }
      } else {
        devToolsOpen = false;
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SecurityContext.Provider value={secureSession}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity deve ser usado dentro de um SecurityProvider');
  }
  return context;
};
