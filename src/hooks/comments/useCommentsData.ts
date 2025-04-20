
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';

export const useCommentsData = (toolId: string) => {
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tool-comments', toolId],
    queryFn: async () => {
      if (!toolId) return [];

      // Buscar comentários principais
      const { data: parentComments, error: parentError } = await supabase
        .from('tool_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url, role)
        `)
        .eq('tool_id', toolId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (parentError) throw parentError;

      // Buscar respostas
      const { data: replies, error: repliesError } = await supabase
        .from('tool_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url, role)
        `)
        .eq('tool_id', toolId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Organizar respostas dentro dos comentários principais
      return parentComments.map((parentComment: Comment) => ({
        ...parentComment,
        replies: replies.filter(
          (reply: Comment) => reply.parent_id === parentComment.id
        )
      }));
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
