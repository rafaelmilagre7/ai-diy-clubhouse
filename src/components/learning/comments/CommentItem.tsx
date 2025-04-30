
import React, { useState } from "react";
import { Comment } from "@/types/learningTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, ThumbsUp, Shield, Trash } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { CommentForm } from "./CommentForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CommentItemProps {
  comment: Comment;
  lessonId: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isReply?: boolean;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  lessonId,
  onReply,
  onDelete,
  onLike,
  isReply = false,
  className = ""
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { user, profile } = useAuth();
  
  const canDelete = 
    user?.id === comment.user_id || 
    profile?.role === 'admin' || 
    profile?.role === 'formacao';
  
  const isAdmin = comment.profiles?.role === 'admin';
  const isFormacao = comment.profiles?.role === 'formacao';
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return "data desconhecida";
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
  };
  
  return (
    <div className={`border rounded-lg p-4 bg-card ${className}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={comment.profiles?.avatar_url || ""} 
            alt={comment.profiles?.name || "Usuário"} 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(comment.profiles?.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {comment.profiles?.name || "Usuário"}
            </span>
            
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            )}
            
            {isFormacao && !isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-600 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Formador
              </span>
            )}
            
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          
          <div className="mt-2 whitespace-pre-line">
            {comment.content}
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 flex items-center gap-1 text-sm"
              onClick={() => onLike(comment.id)}
            >
              <ThumbsUp className="h-4 w-4" />
              {comment.likes_count || 0}
            </Button>
            
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 flex items-center gap-1 text-sm"
                onClick={() => setIsReplying(true)}
              >
                <MessageSquare className="h-4 w-4" />
                Responder
              </Button>
            )}
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 flex items-center gap-1 text-sm text-destructive hover:text-destructive"
                onClick={() => setShowDeleteAlert(true)}
              >
                <Trash className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
          
          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-muted">
              <CommentForm
                lessonId={lessonId}
                parentId={comment.id}
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                placeholder="Escreva sua resposta..."
                autoFocus
                replyingTo={comment}
              />
            </div>
          )}
          
          {/* Respostas a este comentário */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-6 border-l border-muted">
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.id}
                  comment={reply}
                  lessonId={lessonId}
                  onReply={onReply}
                  onDelete={onDelete}
                  onLike={onLike}
                  isReply={true}
                />
              ))}
            </div>
          )}
          
          <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    onDelete(comment.id);
                    setShowDeleteAlert(false);
                  }} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
