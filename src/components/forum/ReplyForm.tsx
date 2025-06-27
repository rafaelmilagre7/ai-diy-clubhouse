
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const replySchema = z.object({
  content: z.string().min(3, { message: "A resposta deve ter pelo menos 3 caracteres." }),
});

const ReplyForm = ({ topicId, parentId, onSuccess, onCancel }: ReplyFormProps) => {
  const { user } = useSimpleAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof replySchema>) => {
    if (!user) {
      toast.error("Você precisa estar logado para responder");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topicId,
          parent_id: parentId,
          content: values.content,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      if (data && !parentId) {
        // CORREÇÃO: Usar RPC function para incrementar replies
        const { error: rpcError } = await supabase
          .rpc('increment_topic_replies', { 
            topic_id: topicId 
          });

        if (rpcError) {
          console.warn('Erro ao incrementar contador de replies:', rpcError);
          // Não falhar a operação por causa disso
        }
      }

      toast.success("Resposta publicada com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      toast.error("Erro ao publicar resposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Textarea
          id="content"
          placeholder="Escreva sua resposta..."
          {...form.register("content")}
          disabled={isSubmitting}
          className="resize-none"
        />
        {form.formState.errors.content && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.content.message}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publicando..." : "Publicar Resposta"}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
