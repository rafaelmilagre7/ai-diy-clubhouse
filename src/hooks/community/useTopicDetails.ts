
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { incrementTopicViews } from "@/lib/supabase/rpc";

interface TopicDetails {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_activity_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ForumPost {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  topic_id: string;
  parent_id?: string | null;
  is_solution: boolean;
  is_hidden: boolean;
  profiles: {
    id: string;
    name: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
}

export function useTopicDetails(topicId: string) {
  const queryClient = useQueryClient();

  // Incrementar visualizações quando carregar o tópico
  const incrementViews = useMutation({
    mutationFn: async () => {
      await incrementTopicViews(topicId);
    },
    onError: (error) => {
      console.error("Erro ao incrementar visualizações:", error);
    }
  });

  // Buscar detalhes do tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<TopicDetails | null> => {
      if (!topicId) return null;

      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, role),
          category:forum_categories!forum_topics_category_id_fkey (id, name, slug)
        `)
        .eq('id', topicId)
        .single();

      if (error) {
        console.error("Erro ao buscar tópico:", error);
        throw error;
      }

      // Incrementar visualizações após carregar
      incrementViews.mutate();

      return data as TopicDetails;
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar posts do tópico
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<ForumPost[]> => {
      if (!topicId) return [];

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (id, name, avatar_url, role)
        `)
        .eq('topic_id', topicId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Erro ao buscar posts:", error);
        throw error;
      }

      return data as ForumPost[];
    },
    enabled: !!topicId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Marcar tópico como resolvido
  const markAsSolved = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase
        .rpc('mark_topic_solved', {
          p_topic_id: topicId,
          p_post_id: postId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
        queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      } else {
        toast.error(data?.error || "Erro ao marcar como solução");
      }
    },
    onError: (error: any) => {
      console.error("Erro ao marcar como solução:", error);
      toast.error("Erro ao marcar como solução");
    }
  });

  return {
    topic,
    posts,
    isLoading: topicLoading || postsLoading,
    error: topicError || postsError,
    markAsSolved: markAsSolved.mutate,
    isMarkingSolved: markAsSolved.isPending,
  };
}
