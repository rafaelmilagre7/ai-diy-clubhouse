
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

interface NewTopicFormProps {
  categoryId: string;
  categorySlug: string;
}

export const NewTopicForm = ({ categoryId, categorySlug }: NewTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("O título do tópico é obrigatório");
      return;
    }
    
    if (!content.trim()) {
      toast.error("O conteúdo do tópico é obrigatório");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Criando novo tópico:", {
        categoryId,
        title: title.trim(),
        content: content.trim(),
        userId: user.id
      });
      
      // Inserir o novo tópico
      const { data: topicData, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          user_id: user.id
        })
        .select("id")
        .single();
        
      if (topicError) {
        console.error("Erro ao criar tópico:", topicError);
        throw topicError;
      }
      
      if (!topicData || !topicData.id) {
        throw new Error("Não foi possível obter o ID do tópico criado");
      }
      
      console.log("Tópico criado com sucesso:", topicData);
      
      toast.success("Tópico criado com sucesso!");
      navigate(`/comunidade/topico/${topicData.id}`);
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error(`Não foi possível criar o tópico: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">Título</label>
        <Input 
          id="title"
          placeholder="Digite um título claro e descritivo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium">Conteúdo</label>
        <Textarea 
          id="content"
          placeholder="Descreva seu tópico em detalhes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          rows={8}
          className="w-full resize-none"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Tópico"
          )}
        </Button>
      </div>
    </form>
  );
};
