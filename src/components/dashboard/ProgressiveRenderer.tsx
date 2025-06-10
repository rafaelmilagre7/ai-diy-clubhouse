
import React, { useState, useEffect, memo, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import OptimizedSkeletonLoader from '@/components/common/OptimizedSkeletonLoader';

interface ProgressiveRendererProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
  rootMargin?: string;
  threshold?: number;
  priority?: 'high' | 'medium' | 'low';
}

const ProgressiveRenderer = memo<ProgressiveRendererProps>(({
  children,
  fallback,
  delay = 0,
  rootMargin = '100px',
  threshold = 0.1,
  priority = 'medium'
}) => {
  const [shouldRender, setShouldRender] = useState(priority === 'high');
  const [isReady, setIsReady] = useState(false);

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  // Prioridade alta renderiza imediatamente
  // Prioridade média e baixa aguardam viewport + delay
  useEffect(() => {
    if (priority === 'high') {
      setIsReady(true);
      return;
    }

    if (inView) {
      setShouldRender(true);
      
      if (delay > 0) {
        const timer = setTimeout(() => {
          setIsReady(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setIsReady(true);
      }
    }
  }, [inView, delay, priority]);

  // Usar requestIdleCallback para renderização não crítica
  useEffect(() => {
    if (shouldRender && priority === 'low' && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setIsReady(true);
      }, { timeout: 2000 });
    }
  }, [shouldRender, priority]);

  const content = useMemo(() => {
    if (isReady) {
      return children;
    }

    if (shouldRender) {
      return fallback || <OptimizedSkeletonLoader variant="solution-card" />;
    }

    return <div ref={ref} className="min-h-[100px]" />;
  }, [isReady, shouldRender, children, fallback, ref]);

  return <>{content}</>;
});

ProgressiveRenderer.displayName = 'ProgressiveRenderer';

export default ProgressiveRenderer;
