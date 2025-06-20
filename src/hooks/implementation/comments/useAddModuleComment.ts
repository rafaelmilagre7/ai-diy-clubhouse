
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useAddModuleComment = (onSuccess: () => void) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addComment = async (moduleId: string, content: string, parentId?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }

    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }

    try {
      setIsSubmitting(true);

      const commentData = {
        module_id: moduleId,
        user_id: user.id,
        content: content.trim(),
        ...(parentId && { parent_id: parentId })
      };

      const { data, error } = await supabase
        .from('tool_comments')
        .insert(commentData as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('Comentário adicionado com sucesso!');
      onSuccess();
      
      return (data as any)?.id;

    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addComment,
    isSubmitting
  };
};
