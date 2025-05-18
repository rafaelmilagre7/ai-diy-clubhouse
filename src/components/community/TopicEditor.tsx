
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image as ImageIcon,
  Eye, 
  Code, 
  Quote, 
  Youtube, 
  BarChart2,
  Smile,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmojiPicker from 'emoji-picker-react';

interface TopicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TopicEditor({ content, onChange, placeholder = "Escreva aqui o conteúdo..." }: TopicEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selectedText = content.substring(startPos, endPos);
    
    // Substituir o texto selecionado ou inserir no cursor
    const newContent = 
      content.substring(0, startPos) + 
      textToInsert.replace("$$", selectedText) + 
      content.substring(endPos);
    
    onChange(newContent);
    
    // Após renderização, definir o cursor para depois do texto inserido
    setTimeout(() => {
      const newPosition = startPos + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const formatText = (tag: string) => {
    const textModifiers: Record<string, string> = {
      'bold': '**$$**',
      'italic': '*$$*',
      'list': '\n- $$',
      'ordered-list': '\n1. $$',
      'link': '[$$](url)',
      'code': '`$$`',
      'quote': '> $$'
    };

    const modifier = textModifiers[tag];
    if (modifier) {
      insertAtCursor(modifier);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem válida
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `forum_images/${fileName}`;

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (error) throw error;

      // Obter URL pública da imagem
      const { data: publicURL } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Inserir o código markdown da imagem no editor
      if (publicURL?.publicUrl) {
        insertAtCursor(`![Imagem](${publicURL.publicUrl})`);
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error(`Erro ao fazer upload da imagem: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiClick = (emoji: any) => {
    insertAtCursor(emoji.emoji);
  };

  const handleYoutubeInsert = () => {
    // Extrair o ID do YouTube
    let videoId = "";
    try {
      const url = new URL(youtubeUrl);
      if (url.hostname === "youtu.be") {
        videoId = url.pathname.substring(1);
      } else if (url.hostname.includes("youtube.com")) {
        videoId = url.searchParams.get("v") || "";
      }
    } catch (e) {
      // Tentar tratar como ID direto
      if (/^[a-zA-Z0-9_-]{11}$/.test(youtubeUrl)) {
        videoId = youtubeUrl;
      }
    }

    if (!videoId) {
      toast.error("URL do YouTube inválida");
      return;
    }

    insertAtCursor(`\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`);
    setShowYoutubeDialog(false);
    setYoutubeUrl("");
  };

  const handlePollInsert = () => {
    // Filtrar opções vazias
    const validOptions = pollOptions.filter(opt => opt.trim() !== "");
    
    if (pollQuestion.trim() === "" || validOptions.length < 2) {
      toast.error("Preencha a pergunta e pelo menos duas opções");
      return;
    }

    const pollMarkdown = `
\n**ENQUETE: ${pollQuestion}**
\n${validOptions.map((opt, i) => `- [ ] ${opt}`).join('\n')}
\n`;

    insertAtCursor(pollMarkdown);
    setShowPollDialog(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      toast.error("Uma enquete precisa ter pelo menos duas opções");
      return;
    }
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  // Função para renderizar markdown simples para o preview
  const renderMarkdown = (text: string) => {
    if (!text) return "";

    let html = text
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>')
      // Imagens
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full my-2 rounded-md" style="max-height: 400px;" />')
      // Negrito
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Itálico
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Citações
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 text-gray-600 dark:text-gray-400 my-2">$1</blockquote>')
      // Código inline
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">$1</code>')
      // Listas não ordenadas
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.+<\/li>(\r?\n)?)+/g, '<ul class="list-disc pl-6 my-2">$&</ul>')
      // Listas ordenadas
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.+<\/li>(\r?\n)?)+/g, '<ol class="list-decimal pl-6 my-2">$&</ol>')
      // YouTube iframe (manter como está)
      .replace(/(<iframe.+?<\/iframe>)/gs, '$1')
      // Enquetes
      .replace(/\*\*ENQUETE: (.+?)\*\*/g, '<div class="bg-muted p-3 rounded-md mt-2"><h4 class="font-bold">Enquete: $1</h4>')
      .replace(/- \[ \] (.+?)(?=\n|$)/g, '<div class="flex items-center gap-2 mt-2"><input type="checkbox" disabled class="rounded-sm" /> <span>$1</span></div>')
      // Quebras de linha
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center flex-wrap gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('bold')} className="h-8 w-8">
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Negrito (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('italic')} className="h-8 w-8">
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Itálico (Ctrl+I)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('link')} className="h-8 w-8">
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inserir link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('list')} className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lista com marcadores</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('ordered-list')} className="h-8 w-8">
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lista numerada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inserir imagem</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowYoutubeDialog(true)}
                  >
                    <Youtube className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inserir vídeo do YouTube</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowPollDialog(true)}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Criar enquete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Inserir emoji</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-full p-0" align="start">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('code')} className="h-8 w-8">
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Código</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => formatText('quote')} className="h-8 w-8">
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Citação</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="text-xs flex items-center gap-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            {isPreview ? "Editar" : "Visualizar"}
          </Button>
        </div>

        <Separator />

        <div className="min-h-[200px]">
          {isPreview ? (
            <div 
              className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-2" 
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleTextareaChange}
              rows={10}
              className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none leading-relaxed p-2"
            />
          )}
        </div>
        
        {isUploading && (
          <div className="text-sm text-muted-foreground">
            Fazendo upload da imagem...
          </div>
        )}
      </div>

      {/* Dialog para inserir vídeo do YouTube */}
      <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir vídeo do YouTube</DialogTitle>
            <DialogDescription>
              Cole o URL do vídeo do YouTube ou o ID do vídeo
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              autoFocus
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>Cancelar</Button>
            <Button onClick={handleYoutubeInsert} disabled={!youtubeUrl.trim()}>Inserir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar enquete */}
      <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Enquete</DialogTitle>
            <DialogDescription>
              Adicione uma pergunta e opções para a sua enquete
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Pergunta</Label>
              <Input
                id="question"
                placeholder="Qual sua opinião sobre..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Opções</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                  />
                  {pollOptions.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removePollOption(index)}
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Remover opção</span>
                      <span>×</span>
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addPollOption}
                className="mt-2"
              >
                Adicionar Opção
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPollDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handlePollInsert} 
              disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim() !== "").length < 2}
            >
              Inserir Enquete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
