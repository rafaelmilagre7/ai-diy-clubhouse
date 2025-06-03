
import { useCallback } from 'react';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';
import { toast } from 'sonner';

interface ConflictData {
  commentId: string;
  localVersion: any;
  serverVersion: any;
  conflictType: 'content' | 'deletion' | 'timestamp';
  timestamp: number;
}

export const useConflictDetection = () => {
  const { log, logError } = useLogging();

  // Detectar conflitos entre versões local e servidor
  const detectConflict = useCallback((
    localComment: Comment,
    serverComment: Comment
  ): ConflictData | null => {
    // Verificar se há conflito de conteúdo
    if (localComment.content !== serverComment.content) {
      log('Conflito de conteúdo detectado', {
        commentId: localComment.id,
        localContent: localComment.content.substring(0, 50),
        serverContent: serverComment.content.substring(0, 50)
      });

      return {
        commentId: localComment.id,
        localVersion: localComment,
        serverVersion: serverComment,
        conflictType: 'content',
        timestamp: Date.now()
      };
    }

    // Verificar conflito de timestamp (edição simultânea)
    const localTime = new Date(localComment.created_at).getTime();
    const serverTime = new Date(serverComment.created_at).getTime();
    const timeDiff = Math.abs(localTime - serverTime);

    if (timeDiff > 5000) { // Diferença maior que 5 segundos
      log('Conflito de timestamp detectado', {
        commentId: localComment.id,
        timeDiff,
        localTime,
        serverTime
      });

      return {
        commentId: localComment.id,
        localVersion: localComment,
        serverVersion: serverComment,
        conflictType: 'timestamp',
        timestamp: Date.now()
      };
    }

    return null;
  }, [log]);

  // Resolver conflito automaticamente quando possível
  const autoResolveConflict = useCallback((conflict: ConflictData): Comment | null => {
    switch (conflict.conflictType) {
      case 'timestamp':
        // Para conflitos de timestamp, usar a versão mais recente
        const localTime = new Date(conflict.localVersion.created_at).getTime();
        const serverTime = new Date(conflict.serverVersion.created_at).getTime();
        
        const winner = serverTime > localTime ? conflict.serverVersion : conflict.localVersion;
        
        log('Conflito resolvido automaticamente', {
          commentId: conflict.commentId,
          winner: serverTime > localTime ? 'server' : 'local',
          method: 'latest_timestamp'
        });
        
        return winner;

      case 'content':
        // Para conflitos de conteúdo, não resolver automaticamente
        // Deixar para o usuário decidir
        toast.warning('Conflito de edição detectado', {
          description: 'Outro usuário editou este comentário. Recarregue para ver a versão mais recente.',
          duration: 7000
        });
        return null;

      case 'deletion':
        // Se um foi deletado, priorizar a deleção
        log('Conflito de deleção resolvido', {
          commentId: conflict.commentId,
          resolution: 'prioritize_deletion'
        });
        return null;

      default:
        return null;
    }
  }, [log]);

  // Detectar conflitos em lote
  const detectBatchConflicts = useCallback((
    localComments: Comment[],
    serverComments: Comment[]
  ): ConflictData[] => {
    const conflicts: ConflictData[] = [];
    
    // Criar mapa para busca rápida
    const serverMap = new Map(serverComments.map(c => [c.id, c]));
    
    localComments.forEach(localComment => {
      const serverComment = serverMap.get(localComment.id);
      if (serverComment) {
        const conflict = detectConflict(localComment, serverComment);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    });

    if (conflicts.length > 0) {
      log('Conflitos em lote detectados', {
        count: conflicts.length,
        types: conflicts.map(c => c.conflictType)
      });
    }

    return conflicts;
  }, [detectConflict, log]);

  // Validar integridade dos dados
  const validateDataIntegrity = useCallback((comments: Comment[]): boolean => {
    try {
      // Verificar estrutura básica
      const isValid = comments.every(comment => 
        comment.id && 
        comment.content !== undefined &&
        comment.user_id &&
        comment.lesson_id &&
        comment.created_at
      );

      if (!isValid) {
        logError('Dados de comentários com estrutura inválida', {
          commentsCount: comments.length,
          sampleComment: comments[0]
        });
        return false;
      }

      // Verificar duplicatas
      const ids = comments.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        logError('Comentários duplicados detectados', {
          totalCount: ids.length,
          uniqueCount: uniqueIds.size
        });
        return false;
      }

      return true;
    } catch (error) {
      logError('Erro na validação de integridade', { error });
      return false;
    }
  }, [logError]);

  return {
    detectConflict,
    autoResolveConflict,
    detectBatchConflicts,
    validateDataIntegrity
  };
};
