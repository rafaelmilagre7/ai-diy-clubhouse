
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Topic, Post } from '@/types/forumTypes';

export const useTopicDetails = (topicId: string) => {
  const queryClient = useQueryClient();

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      
      console.log('🔍 Buscando detalhes do tópico:', topicId);
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, role),
          category:forum_categories!category_id (id, name, slug)
        `)
        .eq('id', topicId)
        .single();
        
      if (error) {
        console.error('❌ Erro ao buscar tópico:', error);
        throw error;
      }
      
      // Incrementar contador de visualizações
      await supabase
        .from('forum_topics')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', topicId);
      
      console.log('✅ Tópico carregado:', data);
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Buscar posts/respostas do tópico
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<Post[]> => {
      if (!topicId) return [];
      
      console.log('🔍 Buscando posts do tópico:', topicId);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, role)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('❌ Erro ao buscar posts:', error);
        throw error;
      }
      
      console.log('✅ Posts carregados:', data?.length || 0);
      return data as Post[];
    },
    enabled: !!topicId
  });

  // Marcar tópico como resolvido
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
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      toast.success('Tópico marcado como resolvido!');
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
    error: null,
    markAsSolved: markAsSolvedMutation.mutate,
    isMarkingSolved: markAsSolvedMutation.isPending
  };
};
