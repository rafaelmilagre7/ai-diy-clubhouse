
import React, { useEffect, ReactNode } from 'react';
import { usePerformance } from '@/contexts/performance/PerformanceProvider';

interface PerformanceWrapperProps {
  children: ReactNode;
  componentName: string;
  trackRender?: boolean;
  trackMount?: boolean;
  context?: string;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
  componentName,
  trackRender = true,
  trackMount = true,
  context = 'component'
}) => {
  const { measureComponentLoad, captureMetric } = usePerformance();

  useEffect(() => {
    if (!trackMount) return;

    const finishMeasure = measureComponentLoad(componentName, context);

    return () => {
      finishMeasure();
    };
  }, [componentName, context, trackMount, measureComponentLoad]);

  useEffect(() => {
    if (trackRender) {
      captureMetric({
        name: `component_render_${componentName}`,
        value: performance.now(),
        context: 'component_render',
        metadata: {
          componentName,
          type: 'render'
        }
      });
    }
  });

  return <>{children}</>;
};

export default PerformanceWrapper;
