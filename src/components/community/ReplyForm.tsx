
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useReplyForm } from "@/hooks/useReplyForm";
import { useFormState } from "@/hooks/useFormState";
import { getInitials } from "@/utils/user";

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const ReplyForm = ({ 
  topicId, 
  parentId, 
  onSuccess, 
  onCancel, 
  placeholder = "Escreva sua resposta..." 
}: ReplyFormProps) => {
  const {
    content,
    textareaRef,
    handleTextareaInput,
    handleSubmit: originalHandleSubmit,
    handleCancel,
    user
  } = useReplyForm({
    topicId,
    parentId,
    onSuccess,
    onCancel
  });

  const { isSubmitting, handleSubmit } = useFormState({
    debounceMs: 200,
    onSuccess
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await handleSubmit(async () => {
      await originalHandleSubmit(e);
    }, "Resposta enviada com sucesso!");
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
          <AvatarFallback>
            {getInitials(user?.user_metadata?.name || user?.email)}
          </AvatarFallback>
        </Avatar>
        
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={handleTextareaInput}
          ref={textareaRef}
          rows={3}
          className="flex-1 resize-none"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Resposta"
          )}
        </Button>
      </div>
    </form>
  );
};
