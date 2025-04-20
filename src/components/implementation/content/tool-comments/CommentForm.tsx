
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/commentTypes';
import { X } from 'lucide-react';

interface CommentFormProps {
  comment: string;
  setComment: (value: string) => void;
  replyTo: Comment | null;
  cancelReply: () => void;
  onSubmit: (e: React.FormEvent) => void;
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
        <div className="bg-muted p-3 rounded-md relative">
          <button
            type="button"
            onClick={cancelReply}
            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
            aria-label="Cancelar resposta"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm text-muted-foreground">
            Respondendo para{' '}
            <span className="font-medium text-foreground">
              {replyTo.profile?.name || 'Usuário'}
            </span>
          </p>
          <p className="text-sm line-clamp-1">{replyTo.content}</p>
        </div>
      )}
      
      <Textarea
        id="comment-input"
        placeholder={replyTo ? "Escreva sua resposta..." : "Compartilhe sua experiência ou dúvida sobre esta solução..."}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none"
      />
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? 'Enviando...' : replyTo ? 'Responder' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
};
