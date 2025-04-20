
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/commentTypes';
import { Loader2, MessageSquare, X } from 'lucide-react';

interface CommentFormProps {
  comment: string;
  setComment: (comment: string) => void;
  replyTo: Comment | null;
  cancelReply: () => void;
  onSubmit: (e?: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const CommentForm = ({
  comment,
  setComment,
  replyTo,
  cancelReply,
  onSubmit,
  isSubmitting
}: CommentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {replyTo && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Respondendo para {replyTo.profiles?.name || 'Usuário'}
            </span>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={cancelReply} 
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Textarea
        id="comment-input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escreva seu comentário ou dúvida sobre esta solução..."
        className="min-h-24 resize-y"
      />
      
      <div className="flex justify-end">
        <Button 
          type="submit"
          disabled={!comment.trim() || isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {replyTo ? 'Responder' : 'Enviar Comentário'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
