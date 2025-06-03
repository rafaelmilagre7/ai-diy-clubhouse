
import { useCallback, useEffect, useRef } from 'react';
import { useLogging } from '@/hooks/useLogging';

interface PersistentOperation {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lessonId: string;
}

export const useOfflinePersistence = (lessonId: string) => {
  const { log, logError } = useLogging();
  const storageKey = `lesson_comments_queue_${lessonId}`;

  // Salvar operações pendentes no localStorage
  const saveToStorage = useCallback((operations: PersistentOperation[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(operations));
      log('Operações salvas no localStorage', { 
        count: operations.length, 
        lessonId 
      });
    } catch (error) {
      logError('Erro ao salvar no localStorage', { error, lessonId });
    }
  }, [storageKey, log, logError, lessonId]);

  // Carregar operações do localStorage
  const loadFromStorage = useCallback((): PersistentOperation[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      const operations = JSON.parse(stored) as PersistentOperation[];
      log('Operações carregadas do localStorage', { 
        count: operations.length, 
        lessonId 
      });
      
      return operations;
    } catch (error) {
      logError('Erro ao carregar do localStorage', { error, lessonId });
      return [];
    }
  }, [storageKey, log, logError, lessonId]);

  // Adicionar operação à persistência
  const persistOperation = useCallback((operation: Omit<PersistentOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    const fullOperation: PersistentOperation = {
      ...operation,
      id: `persist_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
      lessonId
    };

    const existing = loadFromStorage();
    const updated = [...existing, fullOperation];
    saveToStorage(updated);
    
    return fullOperation.id;
  }, [loadFromStorage, saveToStorage, lessonId]);

  // Remover operação da persistência
  const removePersistedOperation = useCallback((operationId: string) => {
    const existing = loadFromStorage();
    const filtered = existing.filter(op => op.id !== operationId);
    saveToStorage(filtered);
    
    log('Operação removida da persistência', { operationId, lessonId });
  }, [loadFromStorage, saveToStorage, log, lessonId]);

  // Incrementar contador de retry
  const incrementRetryCount = useCallback((operationId: string) => {
    const existing = loadFromStorage();
    const updated = existing.map(op => 
      op.id === operationId 
        ? { ...op, retryCount: op.retryCount + 1 }
        : op
    );
    saveToStorage(updated);
  }, [loadFromStorage, saveToStorage]);

  // Limpar operações antigas (mais de 24h)
  const clearOldOperations = useCallback(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const existing = loadFromStorage();
    const filtered = existing.filter(op => op.timestamp > oneDayAgo);
    
    if (filtered.length !== existing.length) {
      saveToStorage(filtered);
      log('Operações antigas removidas', { 
        removed: existing.length - filtered.length,
        lessonId 
      });
    }
  }, [loadFromStorage, saveToStorage, log, lessonId]);

  // Limpar ao montar (operações antigas)
  useEffect(() => {
    clearOldOperations();
  }, [clearOldOperations]);

  return {
    persistOperation,
    removePersistedOperation,
    incrementRetryCount,
    loadFromStorage,
    clearOldOperations,
    
    // Estado
    getPersistedCount: () => loadFromStorage().length
  };
};
