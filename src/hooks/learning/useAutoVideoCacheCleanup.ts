/**
 * Hook para limpeza automática de cache corrompido de vídeos
 * Detecta e limpa referências antigas ao campo video_url
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { devLog, devWarn } from '@/hooks/useOptimizedLogging';
import { toast } from 'sonner';

const CLEANUP_STORAGE_KEY = 'video_cache_cleanup_v1';

export const useAutoVideoCacheCleanup = () => {
  const queryClient = useQueryClient();
  const [cleanupExecuted, setCleanupExecuted] = useState(false);

  useEffect(() => {
    const executeCleanup = async () => {
      // Verificar se limpeza já foi executada nesta sessão
      const alreadyCleaned = localStorage.getItem(CLEANUP_STORAGE_KEY);
      
      if (alreadyCleaned) {
        devLog('✅ [AUTO-CLEANUP] Limpeza já executada anteriormente');
        setCleanupExecuted(true);
        return;
      }

      devLog('🔍 [AUTO-CLEANUP] Verificando necessidade de limpeza...');

      // Verificar se há cache corrompido
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      let hasCorruptedCache = false;

      for (const query of allQueries) {
        const data = query.state.data;
        
        // Verificar se há referências a video_url
        if (data && typeof data === 'object') {
          const dataStr = JSON.stringify(data);
          if (dataStr.includes('video_url') && dataStr.includes('learning')) {
            hasCorruptedCache = true;
            devWarn('🚨 [AUTO-CLEANUP] Cache corrompido detectado em query:', query.queryKey);
            break;
          }
        }
      }

      if (hasCorruptedCache) {
        devLog('🧹 [AUTO-CLEANUP] Iniciando limpeza automática do cache...');
        
        // Limpar todos os caches relacionados a learning
        await queryClient.invalidateQueries({ 
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === 'string' && (
              key.includes('learning') || 
              key.includes('video') || 
              key.includes('lesson')
            );
          }
        });

        // Limpar localStorage/sessionStorage
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('learning') || key.includes('video'))) {
            const value = localStorage.getItem(key);
            if (value && value.includes('video_url')) {
              keysToRemove.push(key);
            }
          }
        }

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          devLog(`🗑️ [AUTO-CLEANUP] Removido localStorage: ${key}`);
        });

        // Marcar limpeza como concluída
        localStorage.setItem(CLEANUP_STORAGE_KEY, new Date().toISOString());
        
        devLog('✅ [AUTO-CLEANUP] Limpeza concluída com sucesso');
        
        toast.info('Cache atualizado', {
          description: 'Os vídeos foram atualizados para a nova versão'
        });
      } else {
        devLog('✅ [AUTO-CLEANUP] Nenhuma limpeza necessária');
        localStorage.setItem(CLEANUP_STORAGE_KEY, new Date().toISOString());
      }

      setCleanupExecuted(true);
    };

    executeCleanup();
  }, [queryClient]);

  return { cleanupExecuted };
};
