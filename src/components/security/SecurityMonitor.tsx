
import { useEffect, useRef } from 'react';
import { secureLogger, logCriticalEvent } from '@/utils/secureLogger';
import { detectSuspiciousEnvironment } from '@/utils/securityUtils';

interface SecurityMonitorProps {
  onSecurityEvent?: (event: string, details: any) => void;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ 
  onSecurityEvent 
}) => {
  const monitoringRef = useRef(false);
  const warningsShown = useRef(new Set<string>());
  const integrityChecks = useRef(0);

  useEffect(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    secureLogger.info("Security Monitor iniciado", "SECURITY_MONITOR");

    // Monitoramento de eventos de segurança
    const securityChecks = () => {
      try {
        const warnings = detectSuspiciousEnvironment();
        
        warnings.forEach(warning => {
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            secureLogger.security({
              type: 'system',
              severity: 'medium',
              description: `Environment security warning: ${warning}`,
              details: { warning, timestamp: new Date().toISOString() }
            }, 'SECURITY_MONITOR');
            
            onSecurityEvent?.(warning, {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent.substring(0, 100)
            });
          }
        });
      } catch (error) {
        secureLogger.error("Erro no monitoramento de segurança", "SECURITY_MONITOR", {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    };

    // Verificar integridade da página com limite de verificações
    const integrityCheck = () => {
      try {
        if (integrityChecks.current > 10) return; // Limitar verificações
        integrityChecks.current++;
        
        // Verificar se scripts maliciosos foram injetados
        const scripts = document.querySelectorAll('script');
        const suspiciousScripts = Array.from(scripts).filter(script => {
          const src = script.src || '';
          const content = script.textContent || '';
          
          // Detectar padrões suspeitos mais específicos
          return (
            (src.includes('eval(') && !src.includes('supabase')) ||
            content.includes('document.write') ||
            content.includes('innerHTML =') ||
            src.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/) || // IPs suspeitos
            content.includes('crypto.getRandomValues') && content.includes('btoa') // Possível mineração
          );
        });

        if (suspiciousScripts.length > 0) {
          logCriticalEvent("Scripts suspeitos detectados na página", {
            count: suspiciousScripts.length,
            scriptSources: suspiciousScripts.map(s => s.src || 'inline').slice(0, 3)
          });
          
          onSecurityEvent?.('suspicious_scripts', {
            count: suspiciousScripts.length,
            timestamp: new Date().toISOString()
          });
        }

        // Verificar modificações no DOM críticas
        const criticalElements = document.querySelectorAll('[data-security-critical]');
        if (criticalElements.length === 0 && document.querySelector('#root')) {
          secureLogger.warn("Elementos críticos de segurança não encontrados", "SECURITY_MONITOR");
        }

      } catch (error) {
        // Falhar silenciosamente para não quebrar a aplicação
        secureLogger.debug("Erro na verificação de integridade", "SECURITY_MONITOR", {
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
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
            secureLogger.security({
              type: 'system',
              severity: 'low',
              description: "Carregamento anormalmente lento detectado",
              details: { loadTime: now, threshold: 30000 }
            }, 'SECURITY_MONITOR');
          }

          // Detectar uso excessivo de memória
          if ('memory' in performance && (performance as any).memory) {
            const memory = (performance as any).memory;
            const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
            
            if (memoryUsage > 0.9) {
              secureLogger.warn("Alto uso de memória detectado", "SECURITY_MONITOR", {
                memoryUsage: Math.round(memoryUsage * 100) + '%'
              });
            }
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

    // Monitoramento contínuo com intervalos diferenciados
    const securityInterval = setInterval(securityChecks, 45000); // 45 segundos
    const integrityInterval = setInterval(integrityCheck, 90000); // 1.5 minutos
    const performanceInterval = setInterval(performanceMonitor, 120000); // 2 minutos

    // Limpeza
    return () => {
      clearInterval(securityInterval);
      clearInterval(integrityInterval);
      clearInterval(performanceInterval);
      monitoringRef.current = false;
      
      secureLogger.info("Security Monitor desativado", "SECURITY_MONITOR");
    };
  }, [onSecurityEvent]);

  // Este componente não renderiza nada visualmente
  return null;
};
