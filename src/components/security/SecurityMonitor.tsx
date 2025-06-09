
import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

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

    logger.info("Security Monitor iniciado", {
      component: 'SECURITY_MONITOR'
    });

    // Verificações de segurança básicas (simplificadas)
    const basicSecurityCheck = () => {
      try {
        // Verificar ambiente de desenvolvimento em produção
        if (process.env.NODE_ENV === 'development' && 
            !window.location.hostname.includes('localhost') &&
            !window.location.hostname.includes('127.0.0.1')) {
          
          const warning = 'Development mode em ambiente não local';
          if (!warningsShown.current.has(warning)) {
            warningsShown.current.add(warning);
            
            logger.warn("Aviso de segurança detectado", {
              component: 'SECURITY_MONITOR',
              warning
            });
            
            onSecurityEvent?.(warning, {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent.substring(0, 100)
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
                memoryUsage: Math.round(memoryUsage * 100) + '%'
              });
            }
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

    // Executar verificação inicial
    basicSecurityCheck();

    // Monitoramento com intervalo maior para reduzir carga
    const securityInterval = setInterval(basicSecurityCheck, 120000); // 2 minutos

    // Limpeza
    return () => {
      clearInterval(securityInterval);
      monitoringRef.current = false;
      
      logger.info("Security Monitor desativado", {
        component: 'SECURITY_MONITOR'
      });
    };
  }, [onSecurityEvent]);

  // Este componente não renderiza nada visualmente
  return null;
};
