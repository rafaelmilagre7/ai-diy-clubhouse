
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, MessageSquare, ThumbsUp, Pin, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "@/types/forumTypes";
import { PostActions } from "./PostActions";
import { PostContextMenu } from "./PostContextMenu";
import { SolutionBadge } from "./SolutionBadge";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";

interface PostItemProps {
  post: Post;
  // Props para controlar funcionalidades específicas
  showActions?: boolean;
  showContextMenu?: boolean;
  showModerationActions?: boolean;
  showReplyCount?: boolean;
  showLikes?: boolean;
  showSolutionBadge?: boolean;
  isReply?: boolean;
  isTopicAuthor?: boolean;
  isAdmin?: boolean;
  canMarkAsSolved?: boolean;
  onReply?: () => void;
  onMarkAsSolved?: () => void;
  onUnmarkAsSolved?: () => void;
  onDelete?: () => void;
  className?: string;
  // Props para layout
  variant?: "default" | "compact" | "detailed";
}

export const PostItem = ({
  post,
  showActions = false,
  showContextMenu = false,
  showModerationActions = false,
  showReplyCount = false,
  showLikes = false,
  showSolutionBadge = true,
  isReply = false,
  isTopicAuthor = false,
  isAdmin = false,
  canMarkAsSolved = false,
  onReply,
  onMarkAsSolved,
  onUnmarkAsSolved,
  onDelete,
  className = "",
  variant = "default"
}: PostItemProps) => {
  const { openReportModal } = useReporting();

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const isOwner = post.user_id === post.profiles?.id; // Ajustar conforme estrutura de auth
  const isSolutionPost = post.is_accepted_solution || post.is_solution;

  // Layout compacto para replies ou visualizações simples
  if (variant === "compact") {
    return (
      <div className={`flex gap-3 p-3 ${className}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={post.profiles?.avatar_url || ''} />
          <AvatarFallback className="text-xs">
            {getInitials(post.profiles?.name || 'Usuário')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{post.profiles?.name || 'Usuário'}</span>
            <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
            {isSolutionPost && showSolutionBadge && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Solução
              </Badge>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none text-sm">
            {post.content}
          </div>

          {showActions && (
            <PostActions
              postId={post.id}
              isOwner={isOwner}
              isAdmin={isAdmin}
              isReply={isReply}
              onReply={onReply || (() => {})}
              canMarkAsSolved={canMarkAsSolved}
              isSolutionPost={isSolutionPost}
              onMarkAsSolved={onMarkAsSolved}
              onUnmarkAsSolved={onUnmarkAsSolved}
              onDelete={onDelete}
            />
          )}
        </div>

        {showContextMenu && onDelete && (
          <PostContextMenu onDeleteClick={onDelete} />
        )}
      </div>
    );
  }

  // Layout padrão para posts principais
  return (
    <Card className={`transition-colors hover:bg-muted/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar do Autor */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-viverblue text-white">
              {getInitials(post.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {/* Header do Post */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {post.profiles?.name || 'Usuário'}
                  </h3>
                  
                  {isTopicAuthor && (
                    <Badge variant="outline" className="text-xs">
                      Autor
                    </Badge>
                  )}
                  
                  {isAdmin && (
                    <Badge variant="destructive" className="text-xs">
                      Admin
                    </Badge>
                  )}
                  
                  {isSolutionPost && showSolutionBadge && (
                    <SolutionBadge isSolved={true} />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(post.created_at)}
                </p>
              </div>
              
              {/* Menu de Contexto e Moderação */}
              <div className="flex gap-1">
                {showContextMenu && onDelete && (
                  <PostContextMenu onDeleteClick={onDelete} />
                )}
                
                {showModerationActions && (
                  <ModerationActions
                    type="post"
                    itemId={post.id}
                    currentState={{
                      isHidden: false
                    }}
                    onReport={() => openReportModal('post', post.id, post.user_id)}
                  />
                )}
              </div>
            </div>

            {/* Conteúdo do Post */}
            <div className="prose prose-sm max-w-none mb-4">
              {post.content}
            </div>

            {/* Estatísticas e Métricas */}
            {(showReplyCount || showLikes) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {showLikes && (
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>0 curtidas</span>
                  </div>
                )}
                
                {showReplyCount && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>0 respostas</span>
                  </div>
                )}
              </div>
            )}

            {/* Ações do Post */}
            {showActions && (
              <PostActions
                postId={post.id}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isReply={isReply}
                onReply={onReply || (() => {})}
                canMarkAsSolved={canMarkAsSolved}
                isSolutionPost={isSolutionPost}
                onMarkAsSolved={onMarkAsSolved}
                onUnmarkAsSolved={onUnmarkAsSolved}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
