
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { incrementTopicReplies } from '@/lib/supabase/rpc';
import { AlertCircle } from 'lucide-react';

interface CreateReplyFormProps {
  topicId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateReplyForm: React.FC<CreateReplyFormProps> = ({ 
  topicId, 
  onSuccess,
  onCancel 
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError('O conteúdo da resposta não pode estar vazio');
      return;
    }
    
    if (!user?.id) {
      setError('Você precisa estar logado para enviar uma resposta');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Enviando resposta:', { topicId, content: content.trim() });
      
      // Inserir a resposta
      const { data, error: insertError } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: content.trim()
        })
        .select('*')
        .single();
        
      if (insertError) {
        console.error('Erro ao inserir resposta:', insertError);
        throw insertError;
      }
      
      console.log('Resposta criada:', data);
      
      // Incrementar contador de respostas do tópico
      await incrementTopicReplies(topicId);
      
      // Limpar formulário
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      toast.success('Resposta enviada com sucesso!');
      
      // Invalidar cache das queries
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic-detail', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      setError(`Não foi possível enviar sua resposta: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError(null);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder="Escreva sua resposta..."
              value={content}
              onChange={handleTextareaInput}
              rows={4}
              className="w-full resize-none"
              disabled={isSubmitting}
              maxLength={5000}
            />
            <p className="text-sm text-muted-foreground text-right">
              {content.length}/5000 caracteres
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
