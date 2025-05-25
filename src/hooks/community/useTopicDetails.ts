
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Topic, Post } from '@/types/forumTypes';

export const useTopicDetails = (topicId: string) => {
  const queryClient = useQueryClient();

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          ),
          category:forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();
        
      if (error) throw error;
      
      // Incrementar contador de visualizações
      await supabase.rpc('increment_topic_views', { topic_id: topicId });
      
      return data;
    },
    enabled: !!topicId
  });

  // Buscar posts/respostas do tópico
  const { data: posts = [], isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<Post[]> => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!topicId
  });

  // Mutation para marcar como resolvido
  const markAsSolvedMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Tópico marcado como resolvido!');
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar como resolvido:', error);
      toast.error('Erro ao marcar tópico como resolvido');
    }
  });

  return {
    topic,
    posts,
    isLoading: topicLoading || postsLoading,
    error: topicError || postsError,
    markAsSolved: markAsSolvedMutation.mutate,
    isMarkingSolved: markAsSolvedMutation.isPending
  };
};
