
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/forumTypes';
import { PostItem } from './PostItem';
import { Skeleton } from '@/components/ui/skeleton';

interface PostListProps {
  topicId: string;
}

export const PostList: React.FC<PostListProps> = ({ topicId }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
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
        .is('parent_id', null)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Seja o primeiro a responder este tópico!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Respostas ({posts.length})
      </h3>
      
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post}
          topicId={topicId}
        />
      ))}
    </div>
  );
};
