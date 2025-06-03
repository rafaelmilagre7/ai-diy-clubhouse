
import React, { useEffect, useRef } from 'react';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';

interface PerformanceWrapperProps {
  children: React.ReactNode;
  componentName: string;
  context?: string;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
  componentName,
  context = 'component'
}) => {
  const startTimeRef = useRef<number>(performance.now());
  
  // Verificação de segurança para o contexto
  let measureComponentLoad: ((componentName: string, context?: string) => () => void) | null = null;
  
  try {
    const performanceContext = usePerformance();
    measureComponentLoad = performanceContext.measureComponentLoad;
  } catch (error) {
    // Se o contexto não estiver disponível, apenas log e continue
    console.warn('PerformanceWrapper: Contexto de performance não disponível:', error);
  }

  useEffect(() => {
    if (measureComponentLoad) {
      const endMeasurement = measureComponentLoad(componentName, context);
      
      return () => {
        try {
          endMeasurement();
        } catch (error) {
          console.warn('Erro ao finalizar medição de performance:', error);
        }
      };
    }
  }, [componentName, context, measureComponentLoad]);

  // Log de desenvolvimento para rastrear renderizações
  if (process.env.NODE_ENV === 'development') {
    const currentTime = performance.now();
    const renderTime = currentTime - startTimeRef.current;
    
    if (renderTime > 100) {
      console.warn(`[PERFORMANCE] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  }

  return <>{children}</>;
};
