
/**
 * Utilitário para validação de dados e garantia de integridade
 * Implementa verificações robustas para prevenir falhas por dados incompletos
 */

import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';

/**
 * Verifica se um objeto é um array e retorna um array vazio se não for
 * @param possibleArray O objeto que pode ser um array
 * @returns Array válido ou array vazio
 */
export const ensureArray = <T>(possibleArray: T[] | null | undefined): T[] => {
  if (!possibleArray || !Array.isArray(possibleArray)) {
    return [];
  }
  return possibleArray;
};

/**
 * Verifica e garante integridade de uma lista de comentários
 * @param comments Lista de comentários que pode estar incompleta
 * @param toolId ID da ferramenta/solução associada aos comentários
 * @returns Lista de comentários validada e com valores padrão para campos ausentes
 */
export const validateComments = (
  comments: Comment[] | null | undefined, 
  toolId: string
): Comment[] => {
  const { log } = useLogging();
  const safeComments = ensureArray(comments);
  
  // Verifica integridade dos comentários
  const validatedComments = safeComments.map(comment => {
    // Criar perfil válido com fallback para dados ausentes
    const validatedProfile = comment.profiles ? {
      id: comment.profiles.id || comment.user_id, // Usar user_id como fallback
      name: comment.profiles.name || 'Usuário',
      avatar_url: comment.profiles.avatar_url,
      role: comment.profiles.role
    } : {
      id: comment.user_id, // Sempre usar user_id como ID do perfil
      name: 'Usuário',
      avatar_url: undefined,
      role: undefined
    };

    // Valores padrão para campos potencialmente ausentes
    const validatedComment: Comment = {
      ...comment,
      profiles: validatedProfile,
      replies: ensureArray(comment.replies),
      likes_count: comment.likes_count || 0,
      user_has_liked: !!comment.user_has_liked,
      tool_id: comment.tool_id || toolId
    };
    
    // Verifica se há respostas e as valida também
    if (validatedComment.replies && validatedComment.replies.length > 0) {
      validatedComment.replies = validatedComment.replies.map(reply => ({
        ...reply,
        profiles: reply.profiles ? {
          id: reply.profiles.id || reply.user_id,
          name: reply.profiles.name || 'Usuário',
          avatar_url: reply.profiles.avatar_url,
          role: reply.profiles.role
        } : {
          id: reply.user_id,
          name: 'Usuário',
          avatar_url: undefined,
          role: undefined
        },
        likes_count: reply.likes_count || 0,
        user_has_liked: !!reply.user_has_liked
      }));
    }
    
    return validatedComment;
  });
  
  // Log para diagnóstico da validação
  log('Comentários validados', { 
    originalCount: safeComments.length,
    validatedCount: validatedComments.length,
    toolId
  });
  
  return validatedComments;
};

/**
 * Hook para garantir consistência nas chaves de consulta do React Query
 * para comentários em diferentes partes da aplicação
 */
export const useCommentQueryKeys = () => {
  /**
   * Gera uma chave de consulta padronizada para comentários
   * @param toolId ID da ferramenta/solução
   * @param moduleId ID do módulo (opcional)
   * @param suffix Sufixo adicional (opcional)
   * @returns Array com a chave de consulta padronizada
   */
  const getCommentQueryKey = (toolId: string, moduleId?: string, suffix?: string) => {
    const baseKey = ['solution-comments', toolId];
    
    if (moduleId) {
      baseKey.push(moduleId);
    } else {
      baseKey.push('all');
    }
    
    if (suffix) {
      baseKey.push(suffix);
    }
    
    return baseKey;
  };
  
  /**
   * Gera todas as possíveis variações de chaves de consulta para um conjunto de IDs
   * Útil para invalidação abrangente
   */
  const getAllCommentQueryKeys = (toolId: string, moduleId?: string) => {
    const keys = [
      ['solution-comments', toolId, moduleId || 'all'],
      ['solution-comments', toolId, 'all'],
      ['tool-comments', toolId]
    ];
    
    return keys;
  };
  
  return {
    getCommentQueryKey,
    getAllCommentQueryKeys
  };
};

