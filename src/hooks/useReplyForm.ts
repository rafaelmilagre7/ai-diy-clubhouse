
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface UseReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useReplyForm = ({
  topicId,
  parentId,
  onSuccess,
  onCancel
}: UseReplyFormProps) => {
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createPostMutation = useMutation({
    mutationFn: async (postContent: string) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: postContent.trim(),
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setContent('');
      toast.success('Resposta enviada com sucesso!');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Não foi possível enviar sua resposta. Tente novamente.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('O conteúdo da resposta não pode estar vazio');
      return;
    }

    createPostMutation.mutate(content);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onCancel) onCancel();
  };

  return {
    content,
    isSubmitting: createPostMutation.isPending,
    textareaRef,
    handleTextareaInput,
    handleSubmit,
    handleCancel,
    user
  };
};
