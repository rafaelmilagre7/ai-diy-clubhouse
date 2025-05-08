
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { MessageSquare, Loader2 } from "lucide-react";
import { Comment } from "@/types/learningTypes";

interface CommentFormProps {
  lessonId: string;
  parentId?: string | null;
  onSubmit: (content: string, parentId?: string | null) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  replyingTo?: Comment | null;
  isSubmitting?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  lessonId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Escreva seu comentário...",
  autoFocus = false,
  replyingTo = null,
  isSubmitting = false
}) => {
  const [content, setContent] = useState("");
  const { user, profile } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus no textarea quando o componente é montado (se autoFocus=true)
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  if (!user) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Faça login para comentar nesta aula.</p>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    await onSubmit(content.trim(), parentId);
    setContent("");
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {replyingTo && (
        <div className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
          <div className="flex items-center text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Respondendo a {replyingTo.profiles?.name || "Usuário"}
          </div>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 px-2"
          >
            Cancelar
          </Button>
        </div>
      )}
      
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={profile?.avatar_url || ""} 
            alt={profile?.name || "Usuário"} 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(profile?.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="resize-none min-h-[100px]"
          />
          
          <div className="flex justify-end gap-2">
            {onCancel && !replyingTo && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                replyingTo ? "Responder" : "Comentar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
