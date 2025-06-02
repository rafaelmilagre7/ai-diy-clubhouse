
import { useCallback, useEffect, useRef } from 'react';
import { useLogging } from '@/contexts/logging';

interface PrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  condition?: () => boolean;
}

export const useAdvancedPrefetch = () => {
  const { log } = useLogging();
  const prefetchQueue = useRef<Map<string, Promise<void>>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Configurar Intersection Observer para prefetch baseado em visibilidade
    if ('IntersectionObserver' in window) {
      intersectionObserver.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const prefetchUrl = element.dataset.prefetchUrl;
              
              if (prefetchUrl) {
                prefetchResource(prefetchUrl, { priority: 'low' });
              }
            }
          });
        },
        { threshold: 0.1, rootMargin: '100px' }
      );
    }

    return () => {
      intersectionObserver.current?.disconnect();
    };
  }, []);

  const prefetchResource = useCallback(async (
    url: string, 
    options: PrefetchOptions = {}
  ) => {
    const { priority = 'medium', delay = 0, condition } = options;

    // Verificar condição se fornecida
    if (condition && !condition()) {
      return;
    }

    // Evitar prefetch duplicado
    if (prefetchQueue.current.has(url)) {
      return prefetchQueue.current.get(url);
    }

    const prefetchPromise = performPrefetch(url, priority, delay);
    prefetchQueue.current.set(url, prefetchPromise);

    try {
      await prefetchPromise;
      log('Recurso prefetch realizado', { url, priority });
    } catch (error) {
      log('Erro no prefetch', { url, error });
    } finally {
      prefetchQueue.current.delete(url);
    }

    return prefetchPromise;
  }, [log]);

  const performPrefetch = async (url: string, priority: string, delay: number) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Verificar se a conexão é rápida o suficiente
    if (!shouldPrefetch()) {
      return;
    }

    try {
      // Prefetch baseado no tipo de recurso
      if (url.endsWith('.js') || url.endsWith('.css')) {
        await prefetchAsset(url, priority as 'high' | 'medium' | 'low');
      } else if (url.includes('/api/') || url.includes('supabase.co')) {
        await prefetchData(url);
      } else {
        await prefetchPage(url);
      }
    } catch (error) {
      throw new Error(`Prefetch failed for ${url}: ${error}`);
    }
  };

  const prefetchAsset = async (url: string, priority: 'high' | 'medium' | 'low') => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.endsWith('.js') ? 'script' : 'style';
    
    // Definir prioridade se suportado
    if ('importance' in link) {
      (link as any).importance = priority === 'high' ? 'high' : 'low';
    }

    document.head.appendChild(link);

    return new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Asset prefetch failed'));
      
      // Timeout para evitar travamento
      setTimeout(() => reject(new Error('Prefetch timeout')), 10000);
    });
  };

  const prefetchData = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'HEAD', // Apenas verificar se existe
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const prefetchPage = async (url: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);

    return new Promise<void>((resolve) => {
      // Para páginas, não esperamos o carregamento completo
      setTimeout(resolve, 100);
    });
  };

  const shouldPrefetch = () => {
    // Verificar tipo de conexão
    const connection = (navigator as any).connection;
    
    if (connection) {
      // Não fazer prefetch em conexões lentas
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return false;
      }
      
      // Não fazer prefetch se dados salvos estão habilitados
      if (connection.saveData) {
        return false;
      }
    }

    // Verificar se há muito uso de CPU
    if (window.performance && (window.performance as any).memory) {
      const memory = (window.performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (memoryUsage > 0.8) {
        return false;
      }
    }

    return true;
  };

  const observeForPrefetch = useCallback((element: HTMLElement, url: string) => {
    if (intersectionObserver.current) {
      element.dataset.prefetchUrl = url;
      intersectionObserver.current.observe(element);
    }
  }, []);

  const unobserveForPrefetch = useCallback((element: HTMLElement) => {
    if (intersectionObserver.current) {
      intersectionObserver.current.unobserve(element);
    }
  }, []);

  return {
    prefetchResource,
    observeForPrefetch,
    unobserveForPrefetch,
  };
};
