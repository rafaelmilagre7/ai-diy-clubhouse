
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, Edit } from "lucide-react";
import { TopicEditor } from "./TopicEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("editor");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, isLoading: loadingCategories } = useForumCategories();
  
  // Converter markdown para HTML para preview
  const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-viverblue pl-4 italic my-2 text-muted-foreground">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^1\. (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-viverblue underline hover:text-viverblue/80" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded shadow-sm" />')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<br \/>\s*<li[^>]*>.*?<\/li>)*)/g, '<ul class="list-disc list-inside space-y-1 my-3">$1</ul>');
    html = html.replace(/<br \/>\s*<\/ul>/g, '</ul>');
    html = html.replace(/<ul[^>]*>\s*<br \/>/g, '<ul class="list-disc list-inside space-y-1 my-3">');

    // Wrap content in paragraphs
    if (html && !html.startsWith('<')) {
      html = '<p class="mb-3">' + html + '</p>';
    }

    return html;
  };
  
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
      
      // Converter markdown para HTML antes de salvar
      const htmlContent = convertMarkdownToHtml(content);
      
      // Inserir o novo tópico
      const { data: topicData, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          title: title.trim(),
          content: htmlContent,
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
        <div className="border rounded-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b px-3">
              <TabsList className="h-9">
                <TabsTrigger value="editor" className="text-xs flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Prévia
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="mt-0 p-0">
              <TopicEditor 
                content={content} 
                onChange={setContent} 
                placeholder="Descreva seu tópico em detalhes..." 
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-0">
              {content ? (
                <div 
                  className="prose prose-sm max-w-none p-4 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }}
                />
              ) : (
                <div className="p-4 text-muted-foreground italic min-h-[200px] flex items-center justify-center">
                  Nenhum conteúdo para visualizar
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
