import { useEffect, useState } from 'react';
import { initializeMermaid, isMermaidInitialized } from '@/lib/mermaidManager';

/**
 * Hook para inicializar Mermaid UMA ÚNICA VEZ globalmente
 * Usa o singleton MermaidManager para evitar conflitos
 */
export const useMermaidInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isMermaidInitialized()) {
      if (import.meta.env.DEV) {
        console.log('[useMermaidInit] ⚡ Já estava inicializado');
      }
      setIsInitialized(true);
      return;
    }

    initializeMermaid()
      .then(() => {
        if (import.meta.env.DEV) {
          console.log('[useMermaidInit] ✅ Hook confirmou inicialização');
        }
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('[useMermaidInit] ❌ Erro ao inicializar:', error);
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized && isMermaidInitialized()) {
        if (import.meta.env.DEV) {
          console.warn('[useMermaidInit] ⚠️ Forçando state após timeout');
        }
        setIsInitialized(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isInitialized]);

  return isInitialized;
};
