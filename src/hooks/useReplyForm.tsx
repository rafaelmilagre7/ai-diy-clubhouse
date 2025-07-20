
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { incrementTopicReplies } from "@/lib/supabase/rpc";

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
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("O conteúdo da resposta não pode estar vazio");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para enviar uma resposta");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Enviando resposta:", { 
        topicId, 
        content: content.trim(),
        parentId: parentId || null
      });
      
      // Inserir a resposta
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: content.trim(),
          ...(parentId && { parent_id: parentId })
        })
        .select("*");
        
      if (error) {
        console.error("Erro ao inserir resposta:", error);
        throw error;
      }
      
      console.log("Resposta enviada com sucesso:", data);
      
      // Incrementar contador e atualizar data de última atividade usando a função RPC
      await incrementTopicReplies(topicId);
      
      // Atualizar também a data de última atividade
      await supabase
        .from("forum_topics")
        .update({ 
          last_activity_at: new Date().toISOString()
        })
        .eq("id", topicId);
      
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      toast.success("Resposta enviada com sucesso!");
      
      // Atualizar cache do React Query com nomenclatura padronizada
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Erro ao enviar resposta:", error);
      toast.error(`Não foi possível enviar sua resposta: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
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
