
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
      <div className="text-center p-4 bg-backgroundLight/30 rounded-lg border border-white/10">
        <p className="text-textSecondary">Faça login para comentar nesta aula.</p>
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
        <div className="flex items-center justify-between backdrop-blur-sm bg-primary/10 p-3 rounded-lg border border-primary/20">
          <div className="flex items-center text-sm text-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Respondendo a {replyingTo.profiles?.name || "Usuário"}
          </div>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 px-2 bg-white/10 border-0 hover:bg-white/20 text-muted-foreground hover:text-foreground transition-smooth"
          >
            Cancelar
          </Button>
        </div>
      )}
      
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 ring-2 ring-white/20">
          <AvatarImage 
            src={profile?.avatar_url || ""} 
            alt={profile?.name || "Usuário"} 
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
            {getInitials(profile?.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="resize-none min-h-[100px] bg-white/5 border border-white/20 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/30 focus:bg-white/10 transition-smooth"
          />
          
          <div className="flex justify-end gap-2">
            {onCancel && !replyingTo && (
              <Button 
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
                className="bg-white/5 border-0 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-gradient-to-r from-primary via-primary to-primary/80 text-white hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 border-0 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
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
