
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Criar observer apenas uma vez
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isVisible = entry.isIntersecting;
          setIsIntersecting(isVisible);
          
          if (isVisible && !hasIntersected) {
            setHasIntersected(true);
            
            // Desconectar se triggerOnce for true
            if (triggerOnce && observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        },
        { threshold, rootMargin }
      );
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, hasIntersected]);

  return {
    setElement,
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected
  };
};
