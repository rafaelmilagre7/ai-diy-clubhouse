import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './index';
import { supabase } from '@/lib/supabase';

interface SecurityContextProps {
  logSecurityEvent: (eventType: string, details: any) => Promise<void>;
}

const SecurityContext = createContext<SecurityContextProps | undefined>(undefined);

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const logSecurityEvent = async (eventType: string, details: any) => {
    try {
      await supabase.from('analytics').insert({
        user_id: user?.id || '',
        event_type: 'security_event',
        event_data: {
          security_event_type: eventType,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          ...details
        }
      } as any);
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }
  };

  return (
    <SecurityContext.Provider value={{ logSecurityEvent }}>
      {children}
    </SecurityContext.Provider>
  );
};
