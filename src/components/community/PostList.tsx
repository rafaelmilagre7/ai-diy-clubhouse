
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/utils/dateUtils";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useCommunityPostLike } from "@/hooks/community/useCommunityPostLike";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

interface CommunityPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  topic_id: string;
  likes_count: number;
  user_has_liked?: boolean;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  } | null;
}

interface PostListProps {
  topicId: string;
}

const getInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
};

export const PostList = ({ topicId }: PostListProps) => {
  const { user } = useAuth();
  const { likePost, isProcessing } = useCommunityPostLike(topicId);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', topicId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles_community_public!community_posts_user_id_fkey(id, name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Buscar likes do usuário atual
      if (user) {
        const postIds = data.map(p => p.id);
        const { data: userLikes } = await supabase
          .from('community_reactions')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id)
          .eq('reaction_type', 'like');
        
        const likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
        
        return data.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id)
        })) as CommunityPost[];
      }
      
      return data.map(post => ({ ...post, user_has_liked: false })) as CommunityPost[];
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
        <div 
          key={post.id} 
          id={`post-${post.id}`}
          className="bg-card shadow-sm border-none p-6 rounded-lg scroll-mt-24"
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.name || 'Usuário'} />
              <AvatarFallback className="bg-aurora-primary text-primary-foreground">
                {getInitials(post.profiles?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/perfil/${post.profiles?.id}`}
                  className="font-medium hover:text-aurora-primary hover:underline transition-colors"
                >
                  {post.profiles?.name || 'Usuário'}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
              </div>
              
              <div className="mb-4">
                <MarkdownRenderer content={post.content} />
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => likePost(
                    post.id, 
                    post.user_id, 
                    post.user_has_liked || false, 
                    post.likes_count || 0
                  )}
                  disabled={!user || isProcessing(post.id)}
                  className={cn(
                    "flex items-center gap-1 text-sm transition-all duration-fast",
                    post.user_has_liked 
                      ? "text-aurora-primary font-medium" 
                      : "text-muted-foreground hover:text-primary",
                    isProcessing(post.id) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ThumbsUp className={cn(
                    "h-4 w-4 transition-all",
                    post.user_has_liked && "fill-current scale-110"
                  )} />
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
