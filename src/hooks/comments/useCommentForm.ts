
import { useState } from 'react';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const useCommentForm = (toolId: string, onSuccess: () => void) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("O comentário não pode estar vazio.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const commentData: any = {
        tool_id: toolId,
        user_id: user.id,
        content: comment.trim(),
        parent_id: replyTo ? replyTo.id : null
      };
      
      const { error } = await supabase
        .from('tool_comments')
        .insert(commentData)
        .select('*');
        
      if (error) throw error;
      
      toast.success(replyTo ? "Resposta adicionada com sucesso!" : "Comentário adicionado com sucesso!");
      setComment('');
      setReplyTo(null);
      onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comment,
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment
  };
};
