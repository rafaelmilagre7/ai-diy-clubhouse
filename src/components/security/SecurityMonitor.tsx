
import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';
import { auditLogger } from '@/utils/auditLogger';
import { environmentSecurity } from '@/utils/environmentSecurity';

interface SecurityMonitorProps {
  onSecurityEvent?: (event: string, details: any) => void;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ 
  onSecurityEvent 
}) => {
  const monitoringRef = useRef(false);
  const warningsShown = useRef(new Set<string>());
  const mutationCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());

  useEffect(() => {
    if (monitoringRef.current) return;
    monitoringRef.current = true;

    logger.info("Security Monitor iniciado", {
      component: 'SECURITY_MONITOR',
      environment: environmentSecurity.isProduction() ? 'production' : 'development'
    });

    // Verificações de segurança básicas otimizadas
    const basicSecurityCheck = async () => {
      try {
        // Verificar ambiente de desenvolvimento em produção
        if (!environmentSecurity.isDevelopment() && 
            import.meta.env.DEV) {
          
          const warning = 'Development mode em ambiente não local';
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            logger.warn("Aviso de segurança detectado", {
              component: 'SECURITY_MONITOR',
              warning
            });
            
            await auditLogger.logSecurityEvent('dev_mode_production', 'high', {
              hostname: window.location.hostname,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent.substring(0, 100)
            });
            
            onSecurityEvent?.(warning, {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent.substring(0, 100)
            });
          }
        }

        // Verificar conexão segura
        if (!environmentSecurity.isSecureConnection() && environmentSecurity.isProduction()) {
          const warning = 'Conexão insegura em produção';
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            await auditLogger.logSecurityEvent('insecure_connection', 'critical', {
              protocol: window.location.protocol,
              hostname: window.location.hostname
            });
            
            onSecurityEvent?.(warning, {
              protocol: window.location.protocol,
              hostname: window.location.hostname
            });
          }
        }

        // Verificar uso alto de memória (se disponível)
        if ('memory' in performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
          
          if (memoryUsage > 0.9) {
            const warning = 'Alto uso de memória detectado';
            if (!warningsShown.current.has(warning)) {
              warningsShown.current.add(warning);
              
              logger.warn(warning, {
                component: 'SECURITY_MONITOR',
                memoryUsage: Math.round(memoryUsage * 100) + '%',
                usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB'
              });
            }
          }
        }

        // Verificar domínio confiável
        if (!environmentSecurity.isTrustedDomain()) {
          const warning = 'Domínio não confiável detectado';
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            await auditLogger.logSecurityEvent('untrusted_domain', 'critical', {
              hostname: window.location.hostname,
              referrer: document.referrer || 'direct'
            });
            
            onSecurityEvent?.(warning, {
              hostname: window.location.hostname
            });
          }
        }

      } catch (error) {
        // Falhar silenciosamente para não quebrar a aplicação
        logger.debug("Erro nas verificações de segurança", {
          component: 'SECURITY_MONITOR',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    };

    // Monitorar tentativas de manipulação da página
    const observer = new MutationObserver((mutations) => {
      const now = Date.now();
      
      // Reset contador a cada 30 segundos
      if (now - lastResetRef.current > 30000) {
        mutationCountRef.current = 0;
        lastResetRef.current = now;
      }
      
      mutationCountRef.current += mutations.length;
      
      // Detectar atividade suspeita
      if (mutationCountRef.current > 200) { // Aumentado limite
        const warning = 'excessive_dom_mutations';
        if (!warningsShown.current.has(warning)) {
          warningsShown.current.add(warning);
          
          logger.warn("Atividade DOM suspeita detectada", {
            component: 'SECURITY_MONITOR',
            mutationCount: mutationCountRef.current
          });
          
          auditLogger.logSecurityEvent(warning, 'medium', {
            mutationCount: mutationCountRef.current,
            timeWindow: '30s'
          });
          
          onSecurityEvent?.(warning, {
            mutationCount: mutationCountRef.current
          });
          
          // Reset para evitar spam
          mutationCountRef.current = 0;
        }
      }
      
      // Detectar inserção de scripts maliciosos
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Detectar scripts
              if (element.tagName === 'SCRIPT') {
                const warning = 'script_injection_detected';
                
                logger.warn("Script injection detectado", {
                  component: 'SECURITY_MONITOR',
                  scriptSrc: element.getAttribute('src') || 'inline',
                  scriptContent: element.textContent?.substring(0, 50) || ''
                });
                
                auditLogger.logSecurityEvent(warning, 'high', {
                  scriptSrc: element.getAttribute('src') || 'inline',
                  scriptContent: element.textContent?.substring(0, 100) || '',
                  timestamp: new Date().toISOString()
                });
                
                onSecurityEvent?.(warning, {
                  scriptSrc: element.getAttribute('src') || 'inline',
                  scriptContent: element.textContent?.substring(0, 50) || ''
                });
              }
              
              // Detectar iframes suspeitos
              if (element.tagName === 'IFRAME') {
                const src = element.getAttribute('src');
                if (src && !src.startsWith(window.location.origin)) {
                  logger.warn("Iframe externo detectado", {
                    component: 'SECURITY_MONITOR',
                    iframeSrc: src.substring(0, 100)
                  });
                  
                  auditLogger.logSecurityEvent('external_iframe_detected', 'medium', {
                    iframeSrc: src.substring(0, 100)
                  });
                }
              }
            }
          });
        }
        
        // Detectar modificações em atributos críticos
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;
          
          if (attributeName && ['onclick', 'onload', 'onerror', 'onmouseover'].includes(attributeName)) {
            logger.warn("Atributo de evento modificado", {
              component: 'SECURITY_MONITOR',
              element: target.tagName,
              attribute: attributeName,
              value: target.getAttribute(attributeName)?.substring(0, 50) || ''
            });
            
            auditLogger.logSecurityEvent('event_attribute_modified', 'medium', {
              element: target.tagName,
              attribute: attributeName,
              value: target.getAttribute(attributeName)?.substring(0, 100) || ''
            });
          }
        }
      });
    });
    
    // Iniciar observação
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover', 'src', 'href']
    });

    // Executar verificação inicial
    basicSecurityCheck();

    // Monitoramento com intervalo otimizado (3 minutos)
    const securityInterval = setInterval(basicSecurityCheck, 180000);

    // Limpeza
    return () => {
      clearInterval(securityInterval);
      observer.disconnect();
      monitoringRef.current = false;
      
      logger.info("Security Monitor desativado", {
        component: 'SECURITY_MONITOR'
      });
    };
  }, [onSecurityEvent]);

  // Este componente não renderiza nada visualmente
  return null;
};
