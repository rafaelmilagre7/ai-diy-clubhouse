
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
    // Chave padronizada para todos os comentários
    queryKey: ['comments', toolId],
    queryFn: async () => {
      if (!toolId) return [];

      log('Buscando comentários para ferramenta', { toolId });

      try {
        // Buscar comentários principais sem join automático
        const { data: parentComments, error: parentError } = await supabase
          .from('tool_comments')
          .select('*')
          .eq('tool_id', toolId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) {
          logError('Erro ao buscar comentários principais', parentError);
          throw parentError;
        }

        // Buscar perfis dos usuários que fizeram os comentários
        const userIds = [...new Set(parentComments.map((c: any) => c.user_id))];
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .in('id', userIds);
          
        if (profilesError) {
          logError('Erro ao buscar perfis dos usuários', profilesError);
        }
        
        // Mapear perfis por ID para fácil acesso
        const profilesMap = (userProfiles || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from('tool_comments')
          .select('*')
          .eq('tool_id', toolId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) {
          logError('Erro ao buscar respostas', repliesError);
          throw repliesError;
        }
        
        // Adicionar IDs de usuários de respostas ao conjunto de IDs
        const replyUserIds = [...new Set(replies.map((r: any) => r.user_id))];
        const missingUserIds = replyUserIds.filter(id => !profilesMap[id]);
        
        // Buscar perfis adicionais se necessário
        if (missingUserIds.length > 0) {
          const { data: additionalProfiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .in('id', missingUserIds);
            
          if (additionalProfiles) {
            additionalProfiles.forEach((profile: any) => {
              profilesMap[profile.id] = profile;
            });
          }
        }

        // Verificar curtidas do usuário atual
        let likesMap: Record<string, boolean> = {};
        
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        
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

        // Organizar respostas dentro dos comentários principais
        const organizedComments = (parentComments || []).map((parentComment: any) => ({
          ...parentComment,
          profiles: profilesMap[parentComment.user_id] || null,
          user_has_liked: !!likesMap[parentComment.id],
          replies: (replies || [])
            .filter((reply: any) => reply.parent_id === parentComment.id)
            .map((reply: any) => ({
              ...reply,
              profiles: profilesMap[reply.user_id] || null,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        log('Comentários carregados e organizados', { 
          count: organizedComments.length,
          totalWithReplies: organizedComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    },
    enabled: !!toolId,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  return {
    comments,
    isLoading,
    error,
    refetch
  };
};
