
import { useState, useRef } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useReplyForm = ({ topicId, parentId, onSuccess, onCancel }: UseReplyFormProps) => {
  const { user } = useSimpleAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para responder");
      return;
    }

    if (!content.trim()) {
      toast.error("Por favor, escreva uma resposta");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          parent_id: parentId,
          content: content.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      if (data && !parentId) {
        // Incrementar contador de replies usando RPC
        const { error: rpcError } = await supabase
          .rpc('increment_topic_replies', { 
            topic_id: topicId 
          });

        if (rpcError) {
          console.warn('Erro ao incrementar contador de replies:', rpcError);
        }
      }

      toast.success("Resposta publicada com sucesso!");
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      toast.error("Erro ao publicar resposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  return {
    content,
    isSubmitting,
    textareaRef,
    handleTextareaInput,
    handleSubmit,
    handleCancel,
    user
  };
};
