/**
 * Provider de proteção XSS que inicializa segurança automaticamente
 */
import React, { useEffect, ReactNode } from 'react';
import { applySecurityHeaders, setupCSPMonitoring } from '@/utils/security/contentSecurityPolicy';

interface XSSProtectionProviderProps {
  children: ReactNode;
}

/**
 * Provider que aplica proteções XSS automaticamente quando a app carrega
 */
export const XSSProtectionProvider: React.FC<XSSProtectionProviderProps> = ({ children }) => {
  useEffect(() => {
    // Aplicar headers de segurança
    applySecurityHeaders();
    
    // Configurar monitoramento CSP
    setupCSPMonitoring();
    
    // Log de inicialização
    console.log('[XSS PROTECTION] Sistema de proteção XSS ativado');
    
    // Detectar e substituir document.write perigoso
    const originalDocumentWrite = document.write;
    document.write = function(text: string) {
      console.warn('[XSS PROTECTION] Tentativa de document.write bloqueada:', text);
      // Em vez de executar, apenas log
      return;
    };
    
    // Cleanup
    return () => {
      document.write = originalDocumentWrite;
    };
  }, []);
  
  return <>{children}</>;
};

/**
 * Hook para usar proteção XSS em componentes específicos
 */
export const useXSSProtection = () => {
  const reportSuspiciousActivity = (activity: string, details?: any) => {
    console.warn('[XSS PROTECTION] Atividade suspeita detectada:', {
      activity,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };
  
  const validateInput = (input: string, context: string = 'unknown'): boolean => {
    // Padrões suspeitos
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+=/gi,
      /expression\(/gi,
      /<iframe/gi
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input));
    
    if (isSuspicious) {
      reportSuspiciousActivity('suspicious_input', { input, context });
    }
    
    return !isSuspicious;
  };
  
  return {
    reportSuspiciousActivity,
    validateInput
  };
};