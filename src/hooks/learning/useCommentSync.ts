
import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';

interface SyncOperation {
  id: string;
  type: 'add' | 'update' | 'delete' | 'like';
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useCommentSync = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  const pendingOperationsRef = useRef<Map<string, SyncOperation>>(new Map());
  const syncQueueRef = useRef<SyncOperation[]>([]);
  const isProcessingRef = useRef(false);
  
  const queryKey = ['learning-comments', lessonId];

  // Adicionar operação à fila de sincronização
  const queueOperation = useCallback((operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    syncQueueRef.current.push(syncOperation);
    pendingOperationsRef.current.set(syncOperation.id, syncOperation);
    
    log('Operação adicionada à fila de sync', { 
      operationId: syncOperation.id, 
      type: operation.type,
      lessonId 
    });
    
    // Processar fila
    processQueue();
  }, [log, lessonId]);

  // Processar fila de sincronização
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || syncQueueRef.current.length === 0) {
      return;
    }
    
    isProcessingRef.current = true;
    
    try {
      while (syncQueueRef.current.length > 0) {
        const operation = syncQueueRef.current.shift();
        if (!operation) continue;
        
        try {
          await executeOperation(operation);
          pendingOperationsRef.current.delete(operation.id);
          
          log('Operação sincronizada com sucesso', { 
            operationId: operation.id, 
            type: operation.type 
          });
        } catch (error) {
          // Retry logic
          operation.retryCount++;
          
          if (operation.retryCount < 3) {
            // Recolocar na fila com delay
            setTimeout(() => {
              syncQueueRef.current.unshift(operation);
              processQueue();
            }, Math.pow(2, operation.retryCount) * 1000);
            
            log('Operação falhou, reagendando retry', { 
              operationId: operation.id, 
              retryCount: operation.retryCount 
            });
          } else {
            pendingOperationsRef.current.delete(operation.id);
            logError('Operação falhou definitivamente', { 
              operationId: operation.id, 
              error 
            });
          }
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [log, logError]);

  // Executar operação específica
  const executeOperation = useCallback(async (operation: SyncOperation) => {
    switch (operation.type) {
      case 'add':
        return await executeAddComment(operation.data);
      case 'update':
        return await executeUpdateComment(operation.data);
      case 'delete':
        return await executeDeleteComment(operation.data);
      case 'like':
        return await executeLikeComment(operation.data);
      default:
        throw new Error(`Tipo de operação desconhecido: ${operation.type}`);
    }
  }, []);

  // Executar adição de comentário
  const executeAddComment = useCallback(async (data: { content: string; parentId?: string }) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const { error } = await supabase
      .from('learning_comments')
      .insert({
        lesson_id: lessonId,
        user_id: user.id,
        content: data.content,
        parent_id: data.parentId || null
      });
    
    if (error) throw error;
  }, [user, lessonId]);

  // Executar atualização de comentário
  const executeUpdateComment = useCallback(async (data: { commentId: string; content: string }) => {
    const { error } = await supabase
      .from('learning_comments')
      .update({ content: data.content, updated_at: new Date().toISOString() })
      .eq('id', data.commentId);
    
    if (error) throw error;
  }, []);

  // Executar exclusão de comentário
  const executeDeleteComment = useCallback(async (data: { commentId: string }) => {
    const { error } = await supabase
      .from('learning_comments')
      .delete()
      .eq('id', data.commentId);
    
    if (error) throw error;
  }, []);

  // Executar curtida/descurtida
  const executeLikeComment = useCallback(async (data: { commentId: string; isLiking: boolean }) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    if (data.isLiking) {
      // Adicionar curtida
      const { error } = await supabase
        .from('learning_comment_likes')
        .insert({
          comment_id: data.commentId,
          user_id: user.id
        });
      
      if (error && !error.message.includes('duplicate')) {
        throw error;
      }
    } else {
      // Remover curtida
      const { error } = await supabase
        .from('learning_comment_likes')
        .delete()
        .eq('comment_id', data.commentId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    }
  }, [user]);

  // Sync manual forçado
  const forceSyncAll = useCallback(async () => {
    log('Iniciando sync manual forçado', { lessonId });
    
    // Invalidar cache
    queryClient.invalidateQueries({ queryKey });
    
    // Processar operações pendentes
    await processQueue();
    
    log('Sync manual concluído', { lessonId });
  }, [queryClient, queryKey, processQueue, log, lessonId]);

  // Limpar operações pendentes
  const clearPendingOperations = useCallback(() => {
    syncQueueRef.current = [];
    pendingOperationsRef.current.clear();
    log('Operações pendentes limpas', { lessonId });
  }, [log, lessonId]);

  // Processar fila automaticamente ao montar
  useEffect(() => {
    const interval = setInterval(() => {
      if (syncQueueRef.current.length > 0) {
        processQueue();
      }
    }, 5000); // Processar a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [processQueue]);

  return {
    queueOperation,
    forceSyncAll,
    clearPendingOperations,
    
    // Estado
    pendingOperationsCount: pendingOperationsRef.current.size,
    isProcessing: isProcessingRef.current
  };
};
