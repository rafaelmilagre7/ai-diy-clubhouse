
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForumActions } from '@/hooks/forum/useForumActions';
import { toast } from 'sonner';

interface PostFormProps {
  topicId: string;
  parentId?: string;
  onPostCreated?: () => void;
}

export const PostForm = ({ topicId, parentId, onPostCreated }: PostFormProps) => {
  const { profile } = useAuth();
  const { createPost } = useForumActions();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Se o usuário não estiver logado, não exibe o formulário
  if (!profile?.id) {
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('O conteúdo da resposta não pode estar vazio');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createPost({
        topicId,
        content,
        parentId
      });
      
      // Limpar formulário e notificar sucesso
      setContent('');
      toast.success('Resposta publicada com sucesso');
      
      // Notificar componente pai
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Não foi possível publicar sua resposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Textarea
              placeholder="Escreva sua resposta aqui..."
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? 'Publicando...' : 'Publicar resposta'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
