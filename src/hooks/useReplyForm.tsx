
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { incrementTopicReplies } from "@/lib/supabase/rpc";
import { 
  showModernError, 
  showModernLoading, 
  showModernSuccessWithAction,
  dismissModernToast 
} from "@/lib/toast-helpers";

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
      showModernError(
        "Conteúdo obrigatório",
        "Por favor, escreva sua resposta antes de enviar"
      );
      return;
    }
    
    if (!user?.id) {
      showModernError(
        "Login necessário",
        "Você precisa estar logado para enviar uma resposta"
      );
      return;
    }
    
    const loadingId = showModernLoading(
      "Enviando resposta...",
      "Publicando seu comentário na comunidade"
    );
    
    try {
      setIsSubmitting(true);
      
      console.log("Enviando resposta:", { 
        topicId, 
        content: content.trim(),
        parentId: parentId || null
      });
      
      // Inserir a resposta
      const { data, error } = await supabase
        .from("community_posts")
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

      // 📢 Criar notificação para o autor do tópico (se não for o próprio usuário)
      if (data?.[0]) {
        const { data: topicData } = await supabase
          .from("community_topics")
          .select("user_id, title")
          .eq("id", topicId)
          .single();

        if (topicData && topicData.user_id !== user.id) {
          // Buscar nome do usuário que respondeu
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single();

          const contentPreview = content.trim().substring(0, 100);
          
          await supabase
            .from("notifications")
            .insert({
              user_id: topicData.user_id,
              actor_id: user.id,
              type: "community_reply",
              title: `${profile?.name || "Alguém"} respondeu seu tópico`,
              message: `"${contentPreview}${content.trim().length > 100 ? "..." : ""}"`,
              action_url: `/comunidade/topico/${topicId}#post-${data[0].id}`,
              category: "community",
              priority: 2
            });
        }
      }
      
      // Incrementar contador e atualizar data de última atividade usando a função RPC
      await incrementTopicReplies(topicId);
      
      // Atualizar também a data de última atividade
      await supabase
        .from("community_topics")
        .update({ 
          last_activity_at: new Date().toISOString()
        })
        .eq("id", topicId);
      
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Dismiss loading e mostrar sucesso com ação
      dismissModernToast(loadingId);
      
      showModernSuccessWithAction(
        "Resposta publicada!",
        "Seu comentário está visível para todos na comunidade",
        {
          label: "Ver resposta",
          onClick: () => {
            const postElement = document.querySelector(`[data-post-id="${data?.[0]?.id}"]`);
            if (postElement) {
              postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      );
      
      // Atualizar cache do React Query com nomenclatura padronizada
      queryClient.invalidateQueries({ queryKey: ['community-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Erro ao enviar resposta:", error);
      dismissModernToast(loadingId);
      
      showModernError(
        "Não foi possível enviar",
        error.message || "Tente novamente em alguns instantes"
      );
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
