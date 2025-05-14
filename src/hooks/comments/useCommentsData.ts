
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';

// Interface para o perfil do usuário
interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  role: string;
  [key: string]: any;
}

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
        const profilesMap: Record<string, UserProfile> = {};
        
        (userProfiles || []).forEach((profile: UserProfile) => {
          if (profile && profile.id) {
            profilesMap[profile.id] = profile;
          }
        });

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
            additionalProfiles.forEach((profile: UserProfile) => {
              if (profile && profile.id) {
                profilesMap[profile.id] = profile;
              }
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
            if (like && like.comment_id) {
              acc[like.comment_id] = true;
            }
            return acc;
          }, {});
        }

        // Log para diagnóstico
        log('Dados brutos dos comentários:', { 
          parentCount: parentComments?.length || 0,
          repliesCount: replies?.length || 0,
          profilesCount: Object.keys(profilesMap).length || 0
        });

        // Organizar respostas dentro dos comentários principais
        const organizedComments = (parentComments || []).map((parentComment: any) => ({
          ...parentComment,
          profiles: parentComment.user_id && profilesMap[parentComment.user_id] ? profilesMap[parentComment.user_id] : null,
          user_has_liked: !!likesMap[parentComment.id],
          replies: (replies || [])
            .filter((reply: any) => reply.parent_id === parentComment.id)
            .map((reply: any) => ({
              ...reply,
              profiles: reply.user_id && profilesMap[reply.user_id] ? profilesMap[reply.user_id] : null,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        log('Comentários organizados e processados:', { 
          count: organizedComments.length,
          firstCommentHasProfiles: organizedComments.length > 0 
            ? !!organizedComments[0].profiles 
            : false
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
