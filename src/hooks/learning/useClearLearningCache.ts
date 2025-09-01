/**
 * Hook APRIMORADO para gerenciar limpeza de cache do sistema de learning
 * Resolve problemas de dados corrompidos, queries antigas e cache inconsistente
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { clearLearningCaches } from '@/utils/learningValidation';
import { toast } from 'sonner';
import { devLog } from '@/hooks/useOptimizedLogging';

export function useClearLearningCache() {
  const queryClient = useQueryClient();

  const clearAllLearningCache = useCallback(() => {
    devLog('🧹 [CACHE-ENHANCED] Iniciando limpeza COMPLETA do cache de learning...');
    
    try {
      // 1. Remover TODAS as queries relacionadas (mais agressivo)
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.some(key => 
            typeof key === 'string' && (
              key.includes('learning') || 
              key.includes('course') || 
              key.includes('lesson') || 
              key.includes('module') ||
              key.includes('video') ||
              key.includes('progress') ||
              key.includes('formacao') ||
              key.includes('solution')
            )
          );
        }
      });
      
      // 2. Limpar localStorage e sessionStorage
      clearLearningCaches();
      
      // 3. Limpar cache de queries específicas problemáticas
      queryClient.removeQueries({ queryKey: ['learning_lesson_videos'] });
      queryClient.removeQueries({ queryKey: ['learning-lessons'] });
      queryClient.removeQueries({ queryKey: ['learning-courses'] });
      queryClient.removeQueries({ queryKey: ['learning-modules'] });
      
      // 4. Invalidar queries restantes
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.some(key => 
            typeof key === 'string' && (
              key.includes('learning') || 
              key.includes('course') || 
              key.includes('lesson') || 
              key.includes('module') ||
              key.includes('video') ||
              key.includes('solution')
            )
          );
        }
      });
      
      // 5. Forçar garbage collection do cache
      queryClient.clear();
      
      devLog('✅ [CACHE-ENHANCED] Limpeza completa concluída com sucesso');
      
      toast.success('Cache limpo', {
        description: 'Cache de aprendizado foi limpo completamente'
      });
      
    } catch (error) {
      devLog('❌ [CACHE-ENHANCED] Erro na limpeza:', error);
      toast.error('Erro na limpeza do cache', {
        description: 'Houve um problema ao limpar o cache'
      });
    }
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
    devLog('🔄 [CACHE-ENHANCED] Atualizando dados de learning...');
    
    try {
      // Força recarregamento de dados importantes
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.some(key => 
            typeof key === 'string' && (
              key.includes('learning-courses') ||
              key.includes('learning-modules') ||
              key.includes('learning-lessons') ||
              key.includes('learning_lesson_videos') ||
              key.includes('solution')
            )
          );
        }
      });
      
      devLog('✅ [CACHE-ENHANCED] Atualização de dados iniciada');
      
      toast.info('Dados atualizados', {
        description: 'Recarregando dados de aprendizado...'
      });
      
    } catch (error) {
      devLog('❌ [CACHE-ENHANCED] Erro na atualização:', error);
    }
  }, [queryClient]);
  
  const forceVideoDataReload = useCallback(() => {
    devLog('🎬 [VIDEO-RELOAD] Forçando reload de dados de vídeo...');
    
    try {
      // Limpar especificamente queries de vídeo
      queryClient.removeQueries({ 
        predicate: (query) => {
          const key = JSON.stringify(query.queryKey);
          return key.includes('video') || key.includes('learning_lesson_videos');
        }
      });
      
      // Invalidar e refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = JSON.stringify(query.queryKey);
          return key.includes('video') || key.includes('lesson');
        }
      });
      
      devLog('✅ [VIDEO-RELOAD] Reload de vídeos iniciado');
      
      toast.success('Vídeos recarregados', {
        description: 'Dados de vídeo foram atualizados'
      });
      
    } catch (error) {
      devLog('❌ [VIDEO-RELOAD] Erro no reload:', error);
    }
  }, [queryClient]);

  return {
    clearAllLearningCache,
    clearSpecificCache,
    refreshLearningData,
    forceVideoDataReload
  };
}