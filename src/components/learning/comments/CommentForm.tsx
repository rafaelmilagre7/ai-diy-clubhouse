
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
        <div className="flex items-center justify-between bg-viverblue/10 p-2 rounded-md border border-viverblue/20">
          <div className="flex items-center text-sm text-textSecondary">
            <MessageSquare className="h-4 w-4 mr-2 text-viverblue" />
            Respondendo a {replyingTo.profiles?.name || "Usuário"}
          </div>
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 px-2 hover:bg-viverblue/10 text-textSecondary hover:text-textPrimary"
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
          <AvatarFallback className="bg-viverblue/10 text-viverblue">
            {getInitials(profile?.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="resize-none min-h-[100px] bg-[#151823] border-white/10 text-textPrimary"
          />
          
          <div className="flex justify-end gap-2">
            {onCancel && !replyingTo && (
              <Button 
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-white/10 bg-backgroundLight text-textSecondary hover:bg-backgroundLight/80 hover:text-textPrimary"
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-viverblue hover:bg-viverblue/90 text-white"
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
