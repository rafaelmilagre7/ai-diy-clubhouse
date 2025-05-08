
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Comment } from "@/types/learningTypes";
import { CommentForm } from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  lessonId: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  lessonId,
  onReply,
  onDelete,
  onLike,
  isReply = false
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuth();
  
  // Verifica se o usuário é dono do comentário ou é admin/formacao
  const canDelete = user?.id === comment.user_id || 
    (user && ['admin', 'formacao'].includes(user?.role || ''));
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  const handleReplyClick = () => {
    setIsReplying(!isReplying);
  };
  
  const handleCancelReply = () => {
    setIsReplying(false);
  };
  
  const handleReplySubmit = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      return "data desconhecida";
    }
  };
  
  const profileName = comment.profiles?.name || "Usuário";
  
  return (
    <Card className={`p-4 ${isReply ? 'border-l-4 border-l-primary/20' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url || ""} alt={profileName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{profileName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
            {comment.profiles?.role === 'admin' && (
              <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">Admin</span>
            )}
            {comment.profiles?.role === 'formacao' && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded">Instrutor</span>
            )}
          </div>
          
          <div className="text-sm">
            {comment.content}
          </div>
          
          <div className="flex gap-2 pt-1">
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={handleReplyClick}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Responder
              </Button>
            )}
            
            <Button 
              variant={comment.user_has_liked ? "secondary" : "ghost"}
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              {comment.likes_count || 0}
            </Button>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir
              </Button>
            )}
          </div>
          
          {isReplying && (
            <div className="mt-3 pl-2">
              <CommentForm
                lessonId={lessonId}
                parentId={comment.id}
                onSubmit={handleReplySubmit}
                onCancel={handleCancelReply}
                placeholder="Escreva sua resposta..."
                autoFocus={true}
                replyingTo={comment}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommentItem;
