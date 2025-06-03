
import { useCallback, useRef } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { useOfflinePersistence } from './useOfflinePersistence';

interface QueuedOperation {
  id: string;
  type: 'add' | 'update' | 'delete' | 'like';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'medium' | 'high';
}

export const useSmartCommentQueue = (lessonId: string) => {
  const { log, logError } = useLogging();
  const { persistOperation, removePersistedOperation } = useOfflinePersistence(lessonId);
  const queueRef = useRef<QueuedOperation[]>([]);

  // Adicionar operação à fila
  const enqueueOperation = useCallback((
    type: QueuedOperation['type'],
    data: any,
    priority: QueuedOperation['priority'] = 'medium'
  ) => {
    const operation: QueuedOperation = {
      id: `queue-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    queueRef.current.push(operation);
    
    // Persistir para recuperação offline
    persistOperation({
      type: `queue_${type}`,
      data,
      lessonId
    });

    log('Operação adicionada à fila', { 
      operationId: operation.id,
      type,
      priority,
      lessonId 
    });

    return operation.id;
  }, [persistOperation, lessonId, log]);

  // Processar fila
  const processQueue = useCallback(async (processor: (op: QueuedOperation) => Promise<boolean>) => {
    const queue = [...queueRef.current];
    const processed: string[] = [];

    log('Processando fila de operações', { 
      queueSize: queue.length,
      lessonId 
    });

    for (const operation of queue) {
      try {
        const success = await processor(operation);
        
        if (success) {
          processed.push(operation.id);
          removePersistedOperation(operation.id);
          log('Operação processada com sucesso', { 
            operationId: operation.id,
            type: operation.type 
          });
        } else {
          operation.retryCount++;
          if (operation.retryCount >= 3) {
            processed.push(operation.id);
            logError('Operação descartada após múltiplas tentativas', { 
              operationId: operation.id,
              retryCount: operation.retryCount 
            });
          }
        }
      } catch (error) {
        logError('Erro ao processar operação', { 
          error, 
          operationId: operation.id 
        });
      }
    }

    // Remover operações processadas
    queueRef.current = queueRef.current.filter(op => !processed.includes(op.id));

    log('Processamento da fila concluído', { 
      processed: processed.length,
      remaining: queueRef.current.length 
    });

    return processed.length;
  }, [removePersistedOperation, log, logError]);

  // Limpar fila
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    log('Fila de operações limpa', { lessonId });
  }, [lessonId, log]);

  return {
    enqueueOperation,
    processQueue,
    clearQueue,
    getQueueSize: () => queueRef.current.length
  };
};
