
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useCommentForm = (type: string, id?: string) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentChange = (value: string) => {
    setComment(value);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id || type !== 'suggestion' || !comment.trim()) {
      toast.error('Erro ao enviar comentário');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: id,
          user_id: user.id,
          content: comment.trim()
        });
      
      if (error) throw error;
      
      setComment('');
      toast.success('Comentário enviado com sucesso');
    } catch (err: any) {
      console.error('Erro ao enviar comentário:', err);
      toast.error('Erro ao enviar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comment,
    isSubmitting,
    handleCommentChange,
    handleSubmitComment
  };
};
