/**
 * Hook para gerenciar limpeza de cache do sistema de learning
 * Útil quando há problemas de dados corrompidos ou IDs inválidos
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { clearLearningCaches } from '@/utils/learningValidation';

export function useClearLearningCache() {
  const queryClient = useQueryClient();

  const clearAllLearningCache = useCallback(() => {
    console.log('🧹 [CACHE] Iniciando limpeza completa do cache de learning...');
    
    // 1. Limpar cache do React Query
    queryClient.removeQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('learning') || 
            key.includes('course') || 
            key.includes('lesson') || 
            key.includes('module')
          )
        );
      }
    });
    
    // 2. Limpar localStorage e sessionStorage
    clearLearningCaches();
    
    // 3. Invalidar queries restantes
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('learning') || 
            key.includes('course') || 
            key.includes('lesson') || 
            key.includes('module')
          )
        );
      }
    });

    console.log('✅ [CACHE] Limpeza completa do cache de learning concluída');
  }, [queryClient]);

  const clearSpecificCache = useCallback((type: 'course' | 'lesson' | 'module', id?: string) => {
    console.log(`🧹 [CACHE] Limpando cache específico: ${type}${id ? ` - ${id}` : ''}`);
    
    queryClient.removeQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes(type) && 
          (id ? key.includes(id) : true)
        );
      }
    });

    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes(type) &&
          (id ? key.includes(id) : true)
        );
      }
    });

    console.log(`✅ [CACHE] Cache específico limpo: ${type}`);
  }, [queryClient]);

  const refreshLearningData = useCallback(() => {
    console.log('🔄 [CACHE] Atualizando dados de learning...');
    
    // Força recarregamento de dados importantes
    queryClient.refetchQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && (
            key.includes('learning-courses') ||
            key.includes('learning-modules') ||
            key.includes('learning-lessons')
          )
        );
      }
    });

    console.log('✅ [CACHE] Atualização de dados iniciada');
  }, [queryClient]);

  return {
    clearAllLearningCache,
    clearSpecificCache,
    refreshLearningData
  };
}