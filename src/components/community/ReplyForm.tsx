
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  topicId,
  parentId,
  onSuccess,
  placeholder = "Escreva sua resposta..."
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          content: content.trim(),
          user_id: user.id,
          topic_id: topicId,
          parent_id: parentId || null
        });

      if (error) throw error;

      setContent('');
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada com sucesso.",
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      
      onSuccess?.();
      
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none"
      />
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
