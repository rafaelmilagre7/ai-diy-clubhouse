
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
      
      console.log('🔍 Buscando detalhes do tópico:', topicId);
      
      try {
        // Buscar tópico com dados relacionados
        const { data: topicData, error: topicFetchError } = await supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            content,
            created_at,
            updated_at,
            last_activity_at,
            user_id,
            category_id,
            view_count,
            reply_count,
            is_pinned,
            is_locked,
            is_solved
          `)
          .eq('id', topicId)
          .single();
          
        if (topicFetchError) {
          console.error('❌ Erro ao buscar tópico:', topicFetchError);
          throw topicFetchError;
        }
        
        if (!topicData) {
          console.warn('⚠️ Tópico não encontrado');
          return null;
        }

        // Buscar perfil do autor
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .eq('id', topicData.user_id)
          .single();

        // Buscar categoria
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('id, name, slug')
          .eq('id', topicData.category_id)
          .single();

        // Incrementar contador de visualizações
        await supabase
          .from('forum_topics')
          .update({ view_count: (topicData.view_count || 0) + 1 })
          .eq('id', topicId);
        
        // Montar objeto do tópico
        const topic: Topic = {
          ...topicData,
          profiles: profileData ? {
            id: profileData.id,
            name: profileData.name || 'Usuário',
            avatar_url: profileData.avatar_url,
            role: profileData.role || 'member',
            user_id: profileData.id
          } : null,
          category: categoryData ? {
            id: categoryData.id,
            name: categoryData.name || 'Sem categoria',
            slug: categoryData.slug || 'sem-categoria'
          } : null
        };
        
        console.log('✅ Tópico carregado com sucesso:', topic);
        return topic;
      } catch (error) {
        console.error('💥 Erro ao buscar tópico:', error);
        throw error;
      }
    },
    enabled: !!topicId,
    retry: 2,
    staleTime: 30000 // 30 segundos
  });

  // Buscar posts/respostas do tópico
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<Post[]> => {
      if (!topicId) return [];
      
      console.log('🔍 Buscando posts do tópico:', topicId);
      
      try {
        // Buscar posts
        const { data: postsData, error: postsFetchError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            content,
            user_id,
            topic_id,
            created_at,
            updated_at,
            is_solution,
            parent_id
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });
          
        if (postsFetchError) {
          console.error('❌ Erro ao buscar posts:', postsFetchError);
          throw postsFetchError;
        }
        
        if (!postsData || postsData.length === 0) {
          console.log('📭 Nenhum post encontrado para este tópico');
          return [];
        }

        // Buscar perfis dos autores dos posts
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .in('id', userIds);

        if (profilesError) {
          console.error('❌ Erro ao buscar perfis dos posts:', profilesError);
        }

        // Mapear posts com dados dos perfis
        const formattedPosts: Post[] = postsData.map(post => {
          const userProfile = profilesData?.find(profile => profile.id === post.user_id);
          
          return {
            ...post,
            profiles: userProfile ? {
              id: userProfile.id,
              name: userProfile.name || 'Usuário',
              avatar_url: userProfile.avatar_url,
              role: userProfile.role || 'member',
              user_id: userProfile.id
            } : null
          };
        });
        
        console.log('✅ Posts carregados:', formattedPosts.length);
        return formattedPosts;
      } catch (error) {
        console.error('💥 Erro ao buscar posts:', error);
        throw error;
      }
    },
    enabled: !!topicId,
    retry: 2,
    staleTime: 30000 // 30 segundos
  });

  // Marcar tópico como resolvido
  const markAsSolvedMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log('🔧 Marcando tópico como resolvido:', { topicId, postId });
      
      const { data, error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });
      
      if (error) {
        console.error('❌ Erro ao marcar como resolvido:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success('Tópico marcado como resolvido!');
    },
    onError: (error: any) => {
      console.error('💥 Erro ao marcar como resolvido:', error);
      toast.error('Erro ao marcar tópico como resolvido');
    }
  });

  const isLoading = topicLoading || postsLoading;
  const error = topicError || postsError;

  return {
    topic,
    posts: posts || [],
    isLoading,
    error,
    markAsSolved: markAsSolvedMutation.mutate,
    isMarkingSolved: markAsSolvedMutation.isPending
  };
};
