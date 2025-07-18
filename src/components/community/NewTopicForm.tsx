
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { VisualTopicEditor } from "./VisualTopicEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForumCategories } from "@/hooks/community/useForumCategories";

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
}

export const NewTopicForm = ({ categoryId, categorySlug }: NewTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, isLoading: loadingCategories } = useForumCategories();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError("O título do tópico é obrigatório");
      return;
    }
    
    if (!content.trim()) {
      setError("O conteúdo do tópico é obrigatório");
      return;
    }
    
    if (!selectedCategoryId) {
      setError("Por favor, selecione uma categoria para o tópico");
      return;
    }
    
    if (!user?.id) {
      setError("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Inserir o novo tópico com conteúdo em markdown
      const { data: topicData, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: selectedCategoryId,
          user_id: user.id,
          view_count: 0,
          reply_count: 0,
          is_pinned: false,
          is_locked: false,
          last_activity_at: new Date().toISOString()
        })
        .select("id")
        .single();
        
      if (topicError) throw topicError;
      
      toast.success("Tópico criado com sucesso!");
      navigate(`/comunidade/topico/${topicData.id}`);
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      setError("Não foi possível criar o tópico. Tente novamente mais tarde.");
      toast.error("Não foi possível criar o tópico. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
        <label htmlFor="category" className="block text-sm font-medium">Categoria</label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={setSelectedCategoryId}
              disabled={isSubmitting || loadingCategories}
            >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {loadingCategories ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Carregando categorias...</span>
              </div>
            ) : (
              categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
              </SelectContent>
            </Select>
          </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Conteúdo</label>
        <VisualTopicEditor 
          content={content} 
          onChange={setContent} 
          placeholder="Descreva seu tópico em detalhes..." 
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : "Criar Tópico"}
        </Button>
      </div>
    </form>
  );
};
