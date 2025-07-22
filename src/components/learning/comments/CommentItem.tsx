
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
  
  // Debug do objeto comment para verificar sua estrutura
  console.log("Dados do comentário:", comment);
  
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
  
  // Garantindo que profiles tenha valores padrão se for null/undefined
  const profileData = comment.profiles || {
    name: "Usuário",
    role: "",
    avatar_url: "",
    id: "",
    email: ""
  };
  
  // Usando os dados do perfil com verificação
  const profileName = profileData.name || "Usuário";
  const profileRole = profileData.role || "";
  const avatarUrl = profileData.avatar_url || "";
  
  return (
    <div className={`backdrop-blur-sm bg-white/5 border-0 rounded-xl p-4 shadow-lg transition-all duration-300 hover:bg-white/10 ${isReply ? 'border-l-4 border-l-primary/30 ml-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 ring-2 ring-white/20">
          <AvatarImage src={avatarUrl} alt={profileName} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
            {getInitials(profileName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{profileName}</span>
            <span className="text-xs text-muted-foreground/80">{formatDate(comment.created_at)}</span>
            {profileRole === 'admin' && (
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full border border-primary/20">Admin</span>
            )}
            {profileRole === 'formacao' && (
              <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-600 rounded-full border border-amber-500/20">Instrutor</span>
            )}
          </div>
          
          <div className="text-sm text-foreground/90 leading-relaxed">
            {comment.content}
          </div>
          
          <div className="flex gap-2 pt-2">
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs bg-white/5 border-0 hover:bg-white/10 transition-all duration-200"
                onClick={handleReplyClick}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Responder
              </Button>
            )}
            
            <Button 
              variant={comment.user_has_liked ? "secondary" : "ghost"}
              size="sm" 
              className={`h-8 px-3 text-xs border-0 transition-all duration-200 ${
                comment.user_has_liked 
                  ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} />
              {comment.likes_count || 0}
            </Button>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs text-destructive bg-white/5 border-0 hover:bg-destructive/10 transition-all duration-200"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Excluir
              </Button>
            )}
          </div>
          
          {isReplying && (
            <div className="mt-4 pl-2 border-l-2 border-primary/20">
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
    </div>
  );
};

export default CommentItem;
