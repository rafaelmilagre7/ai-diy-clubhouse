
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

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
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? 'Enviando...' : 'Enviar comentário'}
        </Button>
      </form>
    </Form>
  );
};

export default CommentForm;
