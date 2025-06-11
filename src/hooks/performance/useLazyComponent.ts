
import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { useCallback, useRef } from 'react';

interface LazyComponentOptions {
  preload?: boolean;
  retryCount?: number;
  fallbackComponent?: ComponentType<any>;
}

export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> => {
  const { preload = false, retryCount = 3 } = options;
  const componentRef = useRef<LazyExoticComponent<T> | null>(null);

  const createLazyComponent = useCallback(() => {
    if (componentRef.current) {
      return componentRef.current;
    }

    const retryImport = async (attempt: number = 1): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (attempt < retryCount) {
          console.warn(`Falha ao carregar componente, tentativa ${attempt}/${retryCount}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          return retryImport(attempt + 1);
        }
        throw error;
      }
    };

    componentRef.current = lazy(() => retryImport());
    
    // Preload se solicitado
    if (preload) {
      setTimeout(() => {
        importFn().catch(console.warn);
      }, 100);
    }

    return componentRef.current;
  }, [importFn, retryCount, preload]);

  return createLazyComponent();
};
