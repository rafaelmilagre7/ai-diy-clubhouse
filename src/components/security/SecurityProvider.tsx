
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { applySecureCSP, setupSecureCSPMonitoring, getCurrentNonce } from '@/utils/security/secureCSP';
import { cleanupLegacyCSP } from '@/utils/security/legacyCSPCleanup';
import { auditLogger } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/auth';
import { logger } from '@/utils/logger';

interface SecurityContextType {
  isSecureEnvironment: boolean;
  reportSecurityIncident: (incident: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: any) => void;
  getCurrentCSPNonce: () => string;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Usar useAuth de forma segura - pode não estar disponível durante inicialização
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    // AuthProvider ainda não está disponível - continuar sem usuário
    console.log('🛡️ [SECURITY] AuthProvider não disponível ainda, continuando sem usuário');
  }
  
  // Verificar ambiente seguro
  const isSecureEnvironment = React.useMemo(() => {
    // HTTPS em produção
    if (import.meta.env.PROD) {
      return window.location.protocol === 'https:';
    }
    
    // HTTP apenas em localhost para desenvolvimento
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           window.location.protocol === 'https:';
  }, []);
  
  // Função para reportar incidentes de segurança
  const reportSecurityIncident = React.useCallback(async (
    incident: string, 
    severity: 'low' | 'medium' | 'high' | 'critical', 
    details: any = {}
  ) => {
    try {
      await auditLogger.logSecurityEvent(incident, severity, {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100),
        url: window.location.pathname
      });
      
      logger.warn(`Incidente de segurança reportado: ${incident}`, {
        component: 'SECURITY_PROVIDER',
        severity,
        details
      });
      
      // Em incidentes críticos, considerar ações automáticas
      if (severity === 'critical') {
        logger.error("Incidente crítico de segurança detectado", {
          component: 'SECURITY_PROVIDER',
          incident,
          details
        });
      }
    } catch (error) {
      logger.error("Erro ao reportar incidente de segurança", {
        component: 'SECURITY_PROVIDER',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, []);
  
  // Configurar headers de segurança
  useEffect(() => {
    // Limpar CSP legado primeiro
    cleanupLegacyCSP();
    
    // Aplicar CSP segura sem unsafe-inline
    applySecureCSP();
    
    // Configurar monitoramento CSP
    setupSecureCSPMonitoring();
    
    logger.info("CSP segura aplicada (sem unsafe-inline)", {
      component: 'SECURITY_PROVIDER',
      nonce: getCurrentNonce()
    });
    
    // Log de início da sessão de segurança
    if (user) {
      auditLogger.logSystemEvent('security_session_start', {
        isSecureEnvironment,
        protocol: window.location.protocol,
        hostname: window.location.hostname
      });
    }
    
    return () => {
      if (user) {
        auditLogger.logSystemEvent('security_session_end', {
          sessionDuration: 'unknown' // Poderia calcular duração
        });
      }
    };
  }, [user, isSecureEnvironment]);
  
  // Monitorar tentativas de manipulação da página
  useEffect(() => {
    let mutationCount = 0;
    const maxMutations = 100; // Limite para detectar atividade suspeita
    
    const observer = new MutationObserver((mutations) => {
      mutationCount += mutations.length;
      
      if (mutationCount > maxMutations) {
        reportSecurityIncident('excessive_dom_mutations', 'medium', {
          mutationCount,
          threshold: maxMutations
        });
        
        // Reset contador para evitar spam
        mutationCount = 0;
      }
      
      // Detectar inserção de scripts
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'SCRIPT') {
                reportSecurityIncident('script_injection_detected', 'high', {
                  scriptSrc: element.getAttribute('src') || 'inline',
                  scriptContent: element.textContent?.substring(0, 100) || ''
                });
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror'] // Eventos potencialmente perigosos
    });
    
    return () => observer.disconnect();
  }, [reportSecurityIncident]);
  
  const contextValue: SecurityContextType = React.useMemo(() => ({
    isSecureEnvironment,
    reportSecurityIncident,
    getCurrentCSPNonce: getCurrentNonce
  }), [isSecureEnvironment, reportSecurityIncident]);
  
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
