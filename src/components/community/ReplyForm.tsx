
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  onPostCreated?: () => void;
}

export const ReplyForm = ({ 
  topicId, 
  parentId, 
  onSuccess, 
  onCancel, 
  placeholder = "Escreva sua resposta...",
  onPostCreated 
}: ReplyFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('É necessário estar logado para responder');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Digite uma resposta antes de enviar');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        });
      
      if (error) throw error;
      
      // Limpar formulário
      setContent('');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      
      toast.success('Resposta enviada com sucesso!');
      
      if (onSuccess) onSuccess();
      if (onPostCreated) onPostCreated();
      
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Erro ao enviar resposta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={4}
            required
          />
          
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Responder'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
