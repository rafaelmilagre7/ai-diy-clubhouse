
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Eye } from "lucide-react";
import { ContentEditor } from "./ContentEditor";
import { EditorToolbar } from "./EditorToolbar";
import { PollCreator } from "./PollCreator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCategory?: string;
}

export function TopicDialog({
  open,
  onOpenChange,
  preselectedCategory
}: TopicDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(preselectedCategory || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const { user } = useAuth();
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Quando o dialog abrir, resetar os campos e focar no título
    if (open) {
      setTitle("");
      setContent("");
      setCategory(preselectedCategory || "");
      setShowPollCreator(false);
      
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open, preselectedCategory]);

  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleInsertPoll = (pollHtml: string) => {
    setContent(prev => prev + pollHtml);
    setShowPollCreator(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleInsertYouTube = (embedHtml: string) => {
    setContent(prev => prev + embedHtml);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor, adicione um título para o tópico");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Por favor, adicione conteúdo ao tópico");
      return;
    }
    
    if (!category) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Inserir novo tópico
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: category,
          user_id: user.id,
          view_count: 0,
          reply_count: 0,
          is_locked: false,
          is_pinned: false,
          last_activity_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Tópico criado com sucesso!");
      onOpenChange(false);
      
      // Navegar para o novo tópico
      if (data?.id) {
        navigate(`/comunidade/topico/${data.id}`);
      }
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error(`Não foi possível criar o tópico: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Criar novo tópico</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={titleInputRef}
            placeholder="Título do tópico"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
            maxLength={150}
          />
          
          <div className="mb-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Carregando...
                  </div>
                ) : (
                  categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md">
            <EditorToolbar
              onInsertEmoji={handleInsertEmoji}
              onInsertYouTube={handleInsertYouTube}
              onTogglePollCreator={() => setShowPollCreator(!showPollCreator)}
            />
            
            {showPollCreator && (
              <PollCreator 
                onInsertPoll={handleInsertPoll} 
                onCancel={() => setShowPollCreator(false)} 
              />
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-3">
                <TabsList className="h-9">
                  <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">Prévia</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="editor" className="mt-0 p-0">
                <ContentEditor 
                  content={content} 
                  onChange={setContent} 
                  placeholder="Escreva aqui o conteúdo do seu tópico..." 
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0">
                {content ? (
                  <div 
                    className="prose max-w-none p-4"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <div className="p-4 text-muted-foreground italic">
                    Nenhum conteúdo para visualizar
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !content.trim() || !category}
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
      </DialogContent>
    </Dialog>
  );
}
