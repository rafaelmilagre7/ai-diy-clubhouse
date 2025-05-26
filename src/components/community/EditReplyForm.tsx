
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

interface EditReplyFormProps {
  postId: string;
  topicId: string;
  initialContent: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditReplyForm: React.FC<EditReplyFormProps> = ({ 
  postId,
  topicId,
  initialContent,
  onSuccess,
  onCancel 
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError('O conteúdo da resposta não pode estar vazio');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Editando resposta:', { postId, content: content.trim() });
      
      // Atualizar a resposta
      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);
        
      if (updateError) {
        console.error('Erro ao atualizar resposta:', updateError);
        throw updateError;
      }
      
      console.log('Resposta atualizada com sucesso');
      
      toast.success('Resposta editada com sucesso!');
      
      // Invalidar cache das queries
      queryClient.invalidateQueries({ queryKey: ['forum-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic-detail', topicId] });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Erro ao editar resposta:', error);
      setError(`Não foi possível editar sua resposta: ${error.message || 'Erro desconhecido'}`);
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
    setContent(initialContent);
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
      <CardHeader>
        <CardTitle className="text-lg">Editar Resposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              placeholder="Edite sua resposta..."
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
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
