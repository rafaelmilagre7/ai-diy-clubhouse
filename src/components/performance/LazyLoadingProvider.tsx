
import React, { createContext, useContext, useCallback, useState } from 'react';

interface LazyLoadingContextType {
  observedElements: Set<Element>;
  registerElement: (element: Element, callback: () => void) => void;
  unregisterElement: (element: Element) => void;
}

const LazyLoadingContext = createContext<LazyLoadingContextType | null>(null);

export const useLazyLoading = () => {
  const context = useContext(LazyLoadingContext);
  if (!context) {
    throw new Error('useLazyLoading deve ser usado dentro de LazyLoadingProvider');
  }
  return context;
};

export const LazyLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [observedElements] = useState(() => new Set<Element>());
  const [callbacks] = useState(() => new Map<Element, () => void>());
  const [observer] = useState(() => {
    if (typeof window === 'undefined') return null;
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = callbacks.get(entry.target);
            if (callback) {
              callback();
              observer?.unobserve(entry.target);
              callbacks.delete(entry.target);
              observedElements.delete(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  });

  const registerElement = useCallback((element: Element, callback: () => void) => {
    if (!observer) return;
    
    observedElements.add(element);
    callbacks.set(element, callback);
    observer.observe(element);
  }, [observer, observedElements, callbacks]);

  const unregisterElement = useCallback((element: Element) => {
    if (!observer) return;
    
    observer.unobserve(element);
    callbacks.delete(element);
    observedElements.delete(element);
  }, [observer, callbacks, observedElements]);

  return (
    <LazyLoadingContext.Provider value={{
      observedElements,
      registerElement,
      unregisterElement
    }}>
      {children}
    </LazyLoadingContext.Provider>
  );
};
