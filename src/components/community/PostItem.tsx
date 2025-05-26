
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { Post } from "@/types/forumTypes";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";

interface PostItemProps {
  post: Post;
  showTopicContext?: boolean;
}

export const PostItem = ({ post, showTopicContext = false }: PostItemProps) => {
  const { openReportModal } = useReporting();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar do Autor */}
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles?.avatar_url || ''} />
          <AvatarFallback className="bg-viverblue text-white text-sm">
            {getInitials(post.profiles?.name || 'Usuário')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Header com autor e data */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-foreground">
                {post.profiles?.name || 'Usuário'}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.created_at)}
              </span>
              
              {post.is_solution && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Solução
                </Badge>
              )}
            </div>

            {/* Conteúdo do post */}
            <div className="prose prose-sm max-w-none text-foreground">
              <div className="whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
          </div>

          {/* Ações de Moderação */}
          <div className="flex-shrink-0">
            <ModerationActions
              type="post"
              itemId={post.id}
              currentState={{
                isHidden: false // Posts podem ter is_hidden se implementado
              }}
              onReport={() => openReportModal('post', post.id, post.user_id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
