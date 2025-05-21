
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/community/utils/membership";
import { Badge } from "@/components/ui/badge";

interface PostHeaderProps {
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
  };
  formattedDate: string;
  isTopicStarter?: boolean;
  isAuthor?: boolean;
}

export const PostHeader = ({ post, formattedDate, isTopicStarter, isAuthor }: PostHeaderProps) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(post.profiles?.name || '')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{post.profiles?.name || 'Usuário'}</span>
            
            {isTopicStarter && (
              <Badge variant="outline" className="text-xs font-normal border-primary text-primary">
                Autor
              </Badge>
            )}
            
            {post.profiles?.role === 'admin' && (
              <Badge variant="default" className="text-xs font-normal">
                Admin
              </Badge>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
