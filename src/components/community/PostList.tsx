
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/dateUtils";
import { MessageSquare, ThumbsUp, User } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  topic_id: string;
  likes_count: number;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
}

interface PostListProps {
  topicId: string;
}

export const PostList = ({ topicId }: PostListProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey(id, name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as CommunityPost[];
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card shadow-sm border-none p-6 rounded-lg animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-card shadow-sm border-none p-8 rounded-lg text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhuma resposta ainda</h3>
        <p className="text-muted-foreground">Seja o primeiro a responder este tópico!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        {posts.length} {posts.length === 1 ? 'Resposta' : 'Respostas'}
      </h2>
      
      {posts.map((post) => (
        <div key={post.id} className="bg-card shadow-sm border-none p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {post.profiles?.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.name || 'Usuário'} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{post.profiles?.name || 'Usuário'}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
              </div>
              
              <div className="mb-4">
                <MarkdownRenderer content={post.content} />
              </div>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
