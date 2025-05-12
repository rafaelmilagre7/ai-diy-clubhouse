
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';

export const useCommentsData = (toolId: string) => {
  const { log, logError } = useLogging();

  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    // Usando uma chave padrão que será referenciada em outros lugares
    queryKey: ['solution-comments', toolId, 'all'],
    queryFn: async () => {
      if (!toolId) return [];

      log('Buscando comentários para ferramenta', { toolId });

      try {
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles:user_id(id, name, avatar_url, role)
          `)
          .eq('tool_id', toolId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) {
          logError('Erro ao buscar comentários principais', parentError);
          throw parentError;
        }

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles:user_id(id, name, avatar_url, role)
          `)
          .eq('tool_id', toolId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) {
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }

        // Verificar curtidas do usuário atual
        const { user } = await import('@/contexts/auth').then(m => m.useAuth());
        let likesMap: Record<string, boolean> = {};
        
        if (user) {
          const { data: userLikes } = await supabase
            .from('tool_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);

          likesMap = (userLikes || []).reduce((acc: Record<string, boolean>, like: any) => {
            acc[like.comment_id] = true;
            return acc;
          }, {});
        }

        // Log para diagnóstico
        log('Dados brutos dos comentários:', { 
          parentCount: parentComments?.length || 0,
          repliesCount: replies?.length || 0,
          firstParentComment: parentComments?.length > 0 ? {
            id: parentComments[0].id,
            content: parentComments[0].content,
            hasProfile: !!parentComments[0].profiles,
            profileData: parentComments[0].profiles
          } : 'Nenhum comentário'
        });

        // Organizar respostas dentro dos comentários principais com verificação de segurança
        const organizedComments = (parentComments || []).map((parentComment: Comment) => ({
          ...parentComment,
          user_has_liked: !!likesMap[parentComment.id],
          replies: (replies || [])
            .filter((reply: Comment) => reply.parent_id === parentComment.id)
            .map((reply: Comment) => ({
              ...reply,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        log('Comentários organizados e processados:', { 
          count: organizedComments.length,
          firstCommentHasProfiles: organizedComments.length > 0 ? !!organizedComments[0].profiles : false
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    },
    enabled: !!toolId
  });

  return {
    comments,
    isLoading,
    error,
    refetch
  };
};
