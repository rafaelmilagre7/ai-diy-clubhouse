
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';

interface CommentFormProps {
  comment: string;
  isSubmitting: boolean;
  onCommentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CommentForm = ({
  comment,
  isSubmitting,
  onCommentChange,
  onSubmit
}: CommentFormProps) => {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mt-4 space-y-4 p-4 border border-white/10 rounded-lg bg-backgroundLight">
        <FormField
          control={form.control}
          name="comment"
          render={() => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Escreva seu comentário..."
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  rows={3}
                  className="bg-card border-border text-textPrimary resize-y focus-visible:ring-aurora-primary"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !comment.trim()}
            variant="aurora-primary"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Enviando...' : 'Enviar comentário'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommentForm;
