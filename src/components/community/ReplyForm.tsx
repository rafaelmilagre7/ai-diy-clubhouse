
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export const ReplyForm = ({ 
  topicId, 
  parentId, 
  onSuccess, 
  onCancel, 
  placeholder = "Escreva sua resposta..." 
}: ReplyFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      
      // Atualizar o contador de respostas no tópico e data de última atividade
      try {
        // Atualizar a data de última atividade
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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      toast.success("Resposta enviada com sucesso!");
      
      // Atualizar cache do React Query
      queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      
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

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
          <AvatarFallback>{getInitials(user?.user_metadata?.name || user?.email)}</AvatarFallback>
        </Avatar>
        
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={handleTextareaInput}
          ref={textareaRef}
          rows={3}
          className="flex-1 resize-none"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
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
