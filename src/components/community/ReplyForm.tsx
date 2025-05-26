
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ topicId, parentId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('O conteúdo da resposta não pode estar vazio');
      return;
    }
    
    if (!user?.id) {
      toast.error('Você precisa estar logado para enviar uma resposta');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: content.trim(),
          ...(parentId && { parent_id: parentId })
        });
        
      if (error) throw error;
      
      setContent('');
      toast.success('Resposta enviada com sucesso!');
      
      // Invalidar as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Não foi possível enviar sua resposta. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Escreva sua resposta..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="w-full resize-none"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
        </Button>
      </div>
    </form>
  );
};
