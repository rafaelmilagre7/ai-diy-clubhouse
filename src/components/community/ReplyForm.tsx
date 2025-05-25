
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReplyFormProps {
  topicId: string;
  onPostCreated?: () => void;
  parentId?: string;
  placeholder?: string;
  buttonText?: string;
}

export const ReplyForm = ({ 
  topicId, 
  onPostCreated, 
  parentId,
  placeholder = "Escreva sua resposta...",
  buttonText = "Enviar Resposta"
}: ReplyFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; topic_id: string; parent_id?: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          content: postData.content,
          topic_id: postData.topic_id,
          parent_id: postData.parent_id || null,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar contador de respostas do tópico
      await supabase.rpc('increment_topic_reply_count', {
        topic_id: postData.topic_id
      });
      
      return data;
    },
    onSuccess: () => {
      toast.success('Resposta enviada com sucesso!');
      setContent('');
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      onPostCreated?.();
    },
    onError: (error: any) => {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao enviar resposta');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Digite o conteúdo da resposta');
      return;
    }
    
    createPostMutation.mutate({
      content: content.trim(),
      topic_id: topicId,
      parent_id: parentId
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={5000}
        required
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {content.length}/5000 caracteres
        </p>
        <Button 
          type="submit" 
          disabled={createPostMutation.isPending || !content.trim()}
        >
          {createPostMutation.isPending ? 'Enviando...' : buttonText}
        </Button>
      </div>
    </form>
  );
};
