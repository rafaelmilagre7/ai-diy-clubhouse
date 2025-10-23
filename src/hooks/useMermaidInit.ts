import { useEffect, useState } from 'react';
import { initializeMermaid } from '@/lib/mermaidManager';

/**
 * Hook para inicializar Mermaid UMA ÚNICA VEZ globalmente
 * Usa o singleton MermaidManager para evitar conflitos
 */
export const useMermaidInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeMermaid()
      .then(() => {
        console.log('[useMermaidInit] ✅ Hook confirmou inicialização');
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error('[useMermaidInit] ❌ Erro ao inicializar:', error);
      });
  }, []);

  return isInitialized;
};
