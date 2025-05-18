
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PencilLine, Send, Loader2, X, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const QuickPostEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar categorias para seleção rápida
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      console.log("Buscando categorias para QuickPostEditor");
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }
      
      console.log("Categorias encontradas:", data?.length);
      return data;
    }
  });
  
  // Detectar cliques fora do editor para minimizar quando não estiver em foco
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target) && isExpanded && !content.trim() && !title.trim()) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, content, title]);
  
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedCategoryId("");
    setIsSubmitting(false);
  };
  
  const handleExpandEditor = () => {
    if (!user) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    setIsExpanded(true);
  };
  
  const handleCancelExpand = () => {
    if (!isSubmitting) {
      setIsExpanded(false);
      resetForm();
    }
  };
  
  const handleCreateTopic = async (e) => {
    e?.preventDefault();
    
    if (!title.trim()) {
      toast.error("O título do tópico é obrigatório");
      return;
    }
    
    if (!content.trim()) {
      toast.error("O conteúdo do tópico é obrigatório");
      return;
    }
    
    if (!selectedCategoryId) {
      toast.error("Selecione uma categoria para o tópico");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log("Criando novo tópico:", {
        categoryId: selectedCategoryId,
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
          category_id: selectedCategoryId,
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
      
      // Resetar o formulário e minimizar o editor
      resetForm();
      setIsExpanded(false);
      
      // Invalidar a query para atualizar a lista de tópicos
      queryClient.invalidateQueries({ queryKey: ['recentForumTopics'] });
      
      toast.success("Tópico criado com sucesso!");
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error(`Não foi possível criar o tópico: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-6" ref={editorRef}>
      <form onSubmit={handleCreateTopic}>
        <CardHeader className="p-4 pb-0">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 mt-1">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(user?.user_metadata?.name)}</AvatarFallback>
            </Avatar>
            
            {!isExpanded ? (
              <div 
                className="border rounded-lg px-4 py-2.5 flex w-full cursor-text text-muted-foreground hover:bg-accent/50 transition-colors"
                onClick={handleExpandEditor}
              >
                <PencilLine className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>O que você gostaria de compartilhar ou perguntar?</span>
              </div>
            ) : (
              <Input
                placeholder="Título do seu tópico"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
                autoFocus
                disabled={isSubmitting}
              />
            )}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 pt-3">
            <div className="pl-[52px] space-y-3">
              <Textarea 
                placeholder="O que você gostaria de compartilhar ou perguntar?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              
              <div className="flex items-center">
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                  disabled={isSubmitting || categoriesLoading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
        
        {isExpanded && (
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelExpand}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            
            <Button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Publicar Tópico
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
};
