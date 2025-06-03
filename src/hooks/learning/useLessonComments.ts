
import { useOptimizedLessonComments } from './useOptimizedLessonComments';
import { useCommentSync } from './useCommentSync';

export const useLessonComments = (lessonId: string) => {
  // Usar o hook otimizado como base
  const optimizedHook = useOptimizedLessonComments(lessonId);
  
  // Usar sync auxiliar para operações específicas
  const syncHook = useCommentSync(lessonId);

  // Retornar interface unificada
  return {
    // Propriedades principais
    comments: optimizedHook.comments,
    isLoading: optimizedHook.isLoading,
    error: optimizedHook.error,
    isSubmitting: optimizedHook.isSubmitting,
    
    // Ações principais
    addComment: optimizedHook.addComment,
    deleteComment: optimizedHook.deleteComment,
    likeComment: optimizedHook.likeComment,
    forceSync: optimizedHook.performSmartSync,
    
    // Funções específicas (agora disponíveis)
    fetchComments: optimizedHook.fetchComments,
    queryKey: optimizedHook.queryKey,
    
    // Operações de sync
    queueOperation: syncHook.queueOperation,
    forceSyncAll: syncHook.forceSyncAll,
    pendingOperationsCount: syncHook.pendingOperationsCount
  };
};
