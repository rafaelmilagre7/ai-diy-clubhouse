
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment } from '@/types/commentTypes';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(e);
    }
  };
  
  return (
    <Card className="p-4 bg-backgroundLight border-white/10">
      <form onSubmit={handleSubmit} className="space-y-4">
        {replyTo && (
          <div className="flex items-center justify-between p-3 bg-aurora-primary/5 rounded-md border border-aurora-primary/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-aurora-primary" />
              <span className="text-sm font-medium text-textPrimary">
                Respondendo para {replyTo.profiles?.name || 'Usuário'}
              </span>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={cancelReply} 
              className="h-6 w-6 p-0 hover:bg-aurora-primary/10"
            >
              <X className="h-4 w-4 text-textSecondary" />
            </Button>
          </div>
        )}
        
        <Textarea
          id="comment-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={replyTo ? "Escreva sua resposta..." : "Compartilhe sua experiência ou dúvida sobre esta solução..."}
          className="min-h-24 resize-y bg-card border-border text-textPrimary focus-visible:ring-aurora-primary"
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            variant="aurora-primary"
            disabled={!comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {replyTo ? 'Responder' : 'Enviar Comentário'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
