
import React, { ReactNode } from 'react';
import { useSecurityEnforcement } from '@/hooks/useSecurityEnforcement';
import { useSecureSession } from '@/hooks/useSecureSession';
import { SessionManagerWrapper } from '@/components/auth/SessionManagerWrapper';

interface SecurityEnforcementProviderProps {
  children: ReactNode;
}

/**
 * SecurityEnforcementProvider - Wrapper de segurança aprimorado
 * 
 * FASE 3 DO PLANO:
 * - Integração inteligente com session management
 * - Tratamento gracioso de contextos indisponíveis
 * - Session security enforcement
 */
export const SecurityEnforcementProvider: React.FC<SecurityEnforcementProviderProps> = ({ 
  children 
}) => {
  // Hooks de segurança com tratamento de erro gracioso
  try {
    useSecurityEnforcement();
    useSecureSession({
      maxIdleTime: 60, // 60 minutos - otimizado
      checkInterval: 300, // 5 minutos - menos agressivo
      autoLogoutWarning: 10 // 10 minutos de aviso
    });
  } catch (error) {
    // Tratamento gracioso - não quebrar a aplicação se contexto não estiver disponível
    console.warn('[SECURITY] Security hooks não puderam ser inicializados:', error);
  }

  return (
    <>
      {/* Session Management integrado à security layer */}
      <SessionManagerWrapper />
      {children}
    </>
  );
};
