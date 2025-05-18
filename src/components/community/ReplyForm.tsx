
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export const ReplyForm = ({ topicId, parentId, onSuccess }: ReplyFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      
      // Atualiza o contador de respostas no tópico e data de última atividade
      try {
        await supabase.rpc('increment_topic_views', { topic_id: topicId });
        
        // Atualiza a data de última atividade
        await supabase
          .from("forum_topics")
          .update({ 
            last_activity_at: new Date().toISOString(),
            reply_count: supabase.rpc('increment', { 
              row_id: topicId, 
              table_name: 'forum_topics', 
              column_name: 'reply_count' 
            })
          })
          .eq("id", topicId);
      } catch (updateError) {
        console.error("Erro ao atualizar metadados do tópico:", updateError);
        // Não falhar a operação principal se esta parte falhar
      }
      
      setContent("");
      toast.success("Resposta enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Resposta"
          )}
        </Button>
      </div>
    </form>
  );
};
