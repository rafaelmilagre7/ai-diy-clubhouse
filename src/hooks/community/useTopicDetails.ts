
import { useQuery } from '@tanstack/react-query';
import { supabase, incrementTopicViews } from '@/lib/supabase';
import { Topic } from '@/types/forumTypes';

export const useTopicDetails = (topicId: string) => {
  return useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
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
      await incrementTopicViews(topicId);
      
      return data as Topic;
    },
    enabled: !!topicId
  });
};
