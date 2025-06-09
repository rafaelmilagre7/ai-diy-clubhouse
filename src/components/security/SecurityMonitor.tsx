
import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';
import { detectSuspiciousEnvironment } from '@/utils/securityUtils';

interface SecurityMonitorProps {
  onSecurityEvent?: (event: string, details: any) => void;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ 
  onSecurityEvent 
}) => {
  const monitoringRef = useRef(false);
  const warningsShown = useRef(new Set<string>());

  useEffect(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    // Monitoramento de eventos de segurança
    const securityChecks = () => {
      try {
        const warnings = detectSuspiciousEnvironment();
        
        warnings.forEach(warning => {
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            logger.warn(`Evento de segurança detectado: ${warning}`, {
              component: 'SECURITY_MONITOR',
              timestamp: new Date().toISOString()
            });
            
            onSecurityEvent?.(warning, {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent.substring(0, 100)
            });
          }
        });
      } catch (error) {
        logger.error("Erro no monitoramento de segurança", {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          component: 'SECURITY_MONITOR'
        });
      }
    };

    // Verificar integridade da página
    const integrityCheck = () => {
      try {
        // Verificar se scripts maliciosos foram injetados
        const scripts = document.querySelectorAll('script');
        const suspiciousScripts = Array.from(scripts).filter(script => {
          const src = script.src || '';
          const content = script.textContent || '';
          
          // Detectar padrões suspeitos
          return (
            src.includes('eval(') ||
            content.includes('document.write') ||
            content.includes('innerHTML') ||
            src.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) // IPs suspeitos
          );
        });

        if (suspiciousScripts.length > 0) {
          logger.warn("Scripts suspeitos detectados", {
            count: suspiciousScripts.length,
            component: 'SECURITY_MONITOR'
          });
          
          onSecurityEvent?.('suspicious_scripts', {
            count: suspiciousScripts.length,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        // Falhar silenciosamente para não quebrar a aplicação
      }
    };

    // Monitoramento de performance suspeita
    const performanceMonitor = () => {
      try {
        if (typeof performance !== 'undefined' && performance.now) {
          const navigationStart = performance.timeOrigin;
          const now = performance.now();
          
          // Detectar carregamento anormalmente lento (possível ataque)
          if (now > 30000) { // 30 segundos
            logger.warn("Carregamento anormalmente lento detectado", {
              loadTime: now,
              component: 'SECURITY_MONITOR'
            });
          }
        }
      } catch (error) {
        // Falhar silenciosamente
      }
    };

    // Executar verificações iniciais
    securityChecks();
    integrityCheck();
    performanceMonitor();

    // Monitoramento contínuo (menos frequente para performance)
    const securityInterval = setInterval(securityChecks, 30000); // 30 segundos
    const integrityInterval = setInterval(integrityCheck, 60000); // 1 minuto

    // Limpeza
    return () => {
      clearInterval(securityInterval);
      clearInterval(integrityInterval);
      monitoringRef.current = false;
    };
  }, [onSecurityEvent]);

  // Este componente não renderiza nada visualmente
  return null;
};
