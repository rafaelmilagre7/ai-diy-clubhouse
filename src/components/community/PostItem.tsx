
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/components/community/utils/membership";
import { PostActions } from "./PostActions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PostHeader } from "./PostHeader";

interface PostItemProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    topic_id: string;
    created_at: string;
    updated_at: string;
    profiles?: {
      id: string;
      name: string;
      avatar_url?: string | null;
      role?: string;
    } | null;
    replies?: any[];
    is_solution?: boolean;
  };
  topicAuthorId?: string;
  isSolved?: boolean;
  isTopicStarter?: boolean;
  onMarkAsSolution?: (postId: string) => void;
}

export const PostItem = ({ 
  post, 
  topicAuthorId,
  isSolved,
  isTopicStarter,
  onMarkAsSolution 
}: PostItemProps) => {
  const formattedDate = formatDistanceToNow(
    new Date(post.created_at), 
    { addSuffix: true, locale: ptBR }
  );
  
  const isAuthor = post.user_id === topicAuthorId;

  return (
    <div className="border rounded-lg p-4 bg-background">
      <PostHeader 
        post={post} 
        formattedDate={formattedDate} 
        isTopicStarter={isTopicStarter}
        isAuthor={isAuthor}
      />
      
      <div className="mt-3 prose prose-sm max-w-none">
        {post.content}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <PostActions 
          post={post} 
          isAuthor={isAuthor} 
          isSolution={post.is_solution || false}
          canMarkSolution={topicAuthorId === post.user_id && !isSolved} 
          onMarkAsSolution={onMarkAsSolution}
        />
      </div>
      
      {/* Respostas a este post, se houver */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 pl-6 border-l space-y-4">
          {post.replies.map((reply: any) => (
            <div key={reply.id} className="border-t pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(reply.profiles?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-sm">{reply.profiles?.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(
                      new Date(reply.created_at), 
                      { addSuffix: true, locale: ptBR }
                    )}
                  </span>
                </div>
              </div>
              <div className="mt-2 prose prose-sm max-w-none pl-9">
                {reply.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
