
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Eye,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface RichTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const RichTopicEditor = ({ categoryId, categorySlug, onSuccess }: RichTopicEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'bold':
        insertAtCursor('**', '**');
        break;
      case 'italic':
        insertAtCursor('*', '*');
        break;
      case 'underline':
        insertAtCursor('<u>', '</u>');
        break;
      case 'link':
        insertAtCursor('[texto do link](', ')');
        break;
      case 'list':
        insertAtCursor('\n- ', '');
        break;
      case 'ordered-list':
        insertAtCursor('\n1. ', '');
        break;
      case 'quote':
        insertAtCursor('\n> ', '');
        break;
      case 'code':
        insertAtCursor('`', '`');
        break;
      case 'image':
        insertAtCursor('![alt text](', ')');
        break;
    }
  };

  const renderPreview = (text: string) => {
    // Implementação básica de markdown para preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha o título e o conteúdo");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para criar um tópico");
        return;
      }

      const { data, error } = await supabase
        .from('community_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: selectedCategoryId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tópico:', error);
        toast.error("Erro ao criar tópico. Tente novamente.");
        return;
      }

      toast.success("Tópico criado com sucesso!");
      
      // Reset form
      setTitle("");
      setContent("");
      if (!categoryId) {
        setSelectedCategoryId("");
      }
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Criar Novo Tópico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do seu tópico..."
              required
            />
          </div>

          {!categoryId && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-md border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('bold')}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('italic')}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('underline')}
                title="Sublinhado"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('link')}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('image')}
                title="Imagem"
              >
                <Image className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('list')}
                title="Lista"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('ordered-list')}
                title="Lista Numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('quote')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleToolbarAction('code')}
                title="Código"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor/Preview Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="mt-0">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite o conteúdo do seu tópico..."
                  className="min-h-[300px] rounded-t-none border-t-0 resize-none"
                  required
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div 
                  className="min-h-[300px] p-3 border rounded-b-md bg-white prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content ? renderPreview(content) : '<p class="text-gray-400">Nada para mostrar ainda...</p>' 
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Salvar Rascunho
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Tópico"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
