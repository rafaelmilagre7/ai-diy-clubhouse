
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  PencilLine, 
  Send, 
  Loader2, 
  X, 
  ChevronDown, 
  Image as ImageIcon,
  Bold, 
  Italic,
  Link,
  List
} from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const QuickPostEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node) && isExpanded && !content.trim() && !title.trim()) {
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
    setImageUrl(null);
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

  // Formatar texto com elementos HTML
  const formatText = (format: 'bold' | 'italic' | 'link' | 'list') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newContent = content;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        newContent = content.substring(0, start) + `<strong>${selectedText}</strong>` + content.substring(end);
        newCursorPos = start + 8 + selectedText.length;
        break;
      case 'italic':
        newContent = content.substring(0, start) + `<em>${selectedText}</em>` + content.substring(end);
        newCursorPos = start + 4 + selectedText.length;
        break;
      case 'link':
        // Prompt de URL para o link
        const url = prompt('Digite a URL do link:', 'https://');
        if (url) {
          newContent = content.substring(0, start) + `<a href="${url}" target="_blank">${selectedText || url}</a>` + content.substring(end);
          newCursorPos = start + (selectedText ? selectedText.length : url.length) + 15 + url.length;
        }
        break;
      case 'list':
        // Criar uma lista com os itens (1 item por linha)
        const items = selectedText.split('\n').filter(line => line.trim());
        if (items.length > 0) {
          const listItems = items.map(item => `<li>${item}</li>`).join('');
          newContent = content.substring(0, start) + `<ul>${listItems}</ul>` + content.substring(end);
          newCursorPos = start + 4 + listItems.length;
        } else {
          // Se não houver texto selecionado, adicionar uma lista vazia com placeholders
          newContent = content.substring(0, start) + '<ul><li>Item 1</li><li>Item 2</li></ul>' + content.substring(end);
          newCursorPos = start + 26;
        }
        break;
    }

    setContent(newContent);
    
    // Definir foco de volta e posicionar o cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo e tamanho
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }
    
    setUploading(true);
    
    try {
      // Gerar um nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `forum/${fileName}`;
      
      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('forum_images')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Obter URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('forum_images')
        .getPublicUrl(filePath);
        
      // Inserir a imagem no conteúdo (no final do texto atual)
      const imageTag = `<img src="${publicUrlData.publicUrl}" alt="Imagem do tópico" style="max-width: 100%; margin: 10px 0;" />`;
      setContent((prev) => prev + '\n' + imageTag);
      setImageUrl(publicUrlData.publicUrl);
      
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao carregar imagem:', error);
      toast.error(`Erro ao carregar imagem: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      // Limpar o input de arquivo para permitir selecionar a mesma imagem novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Função para abrir o seletor de arquivo
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleCreateTopic = async (e: React.FormEvent) => {
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
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
      
      toast.success("Tópico criado com sucesso!");
      
      // Redirecionar para o tópico criado
      navigate(`/comunidade/topico/${topicData.id}`);
      
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
              {/* Barra de formatação */}
              <div className="flex flex-wrap gap-2 border rounded-md p-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('bold')}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Negrito</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('italic')}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Itálico</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('link')}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Inserir link</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('list')}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Lista</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={triggerImageUpload}
                        className="h-8 w-8 p-0"
                        disabled={uploading}
                        type="button"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Adicionar imagem</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Input de arquivo (invisível) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <Textarea 
                placeholder="O que você gostaria de compartilhar ou perguntar?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
                ref={textareaRef}
              />

              {/* Preview do conteúdo com formatação */}
              {content && (
                <div className="border p-4 rounded-md bg-muted/30">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              )}
              
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
