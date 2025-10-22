
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
  // Usar try/catch para lidar com contexto não disponível durante inicialização
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // Se o contexto não estiver disponível, continuar sem auth
    console.warn('SecurityProvider: AuthContext não disponível ainda, continuando sem auth');
  }
  
  const secureSession = useSecureSession({
    maxIdleTime: 120, // 2 horas (menos agressivo)
    checkInterval: 300, // verificar a cada 5 minutos (menos frequente)
    autoLogoutWarning: 15 // avisar 15 minutos antes (mais tempo)
  });

  // Log de eventos de segurança (sem dados sensíveis)
  useEffect(() => {
    if (!user) return;

    const logSecurityEvent = async (eventType: string) => {
      try {
        // Mapear event_type para os valores válidos
        let mappedEventType = 'view'; // padrão
        if (eventType === 'session_start') {
          mappedEventType = 'start';
        } else if (eventType === 'console_access') {
          mappedEventType = 'view';
        }
        
        await supabase.from('analytics').insert({
          user_id: user.id,
          event_type: mappedEventType,
          event_data: {
            security_event_type: eventType,
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

    // Detectar tentativas de manipulação do console com type safety
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    let consoleWarningShown = false;

    // Override console methods com verificação de tipo
    const overrideConsoleMethod = (methodName: keyof typeof originalConsole) => {
      const original = originalConsole[methodName];
      if (typeof original === 'function') {
        (console as any)[methodName] = (...args: any[]) => {
          if (!consoleWarningShown && import.meta.env.PROD) {
            consoleWarningShown = true;
            original.call(console, '[SECURITY] Detectada atividade no console em produção');
            logSecurityEvent('console_access');
          }
          return original.apply(console, args);
        };
      }
    };

    // Aplicar override apenas para métodos que existem
    if (import.meta.env.PROD) {
      overrideConsoleMethod('log');
      overrideConsoleMethod('warn');
      overrideConsoleMethod('error');
      overrideConsoleMethod('info');
      overrideConsoleMethod('debug');
    }

    return () => {
      // Restaurar console original de forma segura
      Object.assign(console, originalConsole);
    };
  }, [user]);

  // Detectar DevTools abertas com proteção adicional
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    let devToolsOpen = false;
    
    const detectDevTools = () => {
      try {
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
      } catch (error) {
        // Silenciosamente falhar se não conseguir detectar
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, []);

  // Memoizar o valor do context para evitar re-renders desnecessários
  const contextValue = React.useMemo(() => secureSession, [
    secureSession.lastActivity,
    secureSession.isInactive
  ]);

  return (
    <SecurityContext.Provider value={contextValue}>
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
