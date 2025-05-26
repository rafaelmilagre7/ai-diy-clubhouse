
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Youtube, Smile, BarChart, Image } from "lucide-react";
import { TopicEditor } from "./TopicEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmojiPicker from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCategory?: string;
}

export function CreateTopicDialog({ open, onOpenChange, preselectedCategory }: CreateTopicDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(preselectedCategory || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [youtubeUrl, setYoutubeUrl] = useState("");
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
      setPollOptions(["", ""]);
      setPollQuestion("");
      setYoutubeUrl("");
      
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

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return; // Manter pelo menos 2 opções
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Função para extrair ID do YouTube de uma URL
  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const insertYoutubeVideo = () => {
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (youtubeId) {
      const youtubeEmbed = `<div class="youtube-embed">
        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allowfullscreen></iframe>
      </div>`;
      setContent(prev => prev + youtubeEmbed);
      setYoutubeUrl("");
    } else {
      toast.error("URL do YouTube inválida");
    }
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const createPoll = () => {
    if (!pollQuestion.trim()) {
      toast.error("Por favor, adicione uma pergunta para a enquete");
      return;
    }

    const validOptions = pollOptions.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Por favor, adicione pelo menos duas opções válidas");
      return;
    }

    const pollHtml = `
      <div class="poll-container" data-poll-question="${pollQuestion}">
        <h3>${pollQuestion}</h3>
        <div class="poll-options">
          ${validOptions.map(option => `
            <div class="poll-option" data-option="${option}">
              <span>${option}</span>
              <div class="poll-progress" style="width: 0%"></div>
              <span class="poll-count">0 votos</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    setContent(prev => prev + pollHtml);
    setShowPollCreator(false);
    setPollOptions(["", ""]);
    setPollQuestion("");
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
            <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => {
                      insertEmoji(emojiData.emoji);
                    }}
                    width={300}
                    height={400}
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={() => setShowPollCreator(!showPollCreator)}
              >
                <BarChart className="h-4 w-4 mr-1" />
                Enquete
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                    <Youtube className="h-4 w-4 mr-1" />
                    YouTube
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Adicionar vídeo do YouTube</h3>
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Button onClick={insertYoutubeVideo} size="sm" className="w-full">
                      Inserir vídeo
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {showPollCreator ? (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium mb-2">Criar enquete</h3>
                <div className="space-y-3">
                  <Input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Pergunta da enquete"
                    className="mb-2"
                  />
                  
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="flex-1"
                      />
                      {index >= 2 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePollOption(index)}
                          className="h-8 w-8"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addPollOption}
                    >
                      + Adicionar opção
                    </Button>
                    
                    <div className="space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowPollCreator(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={createPoll}
                      >
                        Inserir enquete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b px-3">
                <TabsList className="h-9">
                  <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">Prévia</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="editor" className="mt-0 p-0">
                <TopicEditor 
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
