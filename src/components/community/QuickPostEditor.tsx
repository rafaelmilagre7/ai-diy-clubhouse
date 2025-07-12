
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image as ImageIcon,
  Eye, 
  Code, 
  Quote
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createSafeHTML } from '@/utils/htmlSanitizer';
import { Separator } from "@/components/ui/separator";
import { v4 as uuidv4 } from "uuid";

interface QuickPostEditorProps {
  onPostSuccess?: () => void;
  placeholder?: string;
}

export const QuickPostEditor = ({ 
  onPostSuccess, 
  placeholder = "Escreva aqui o conteúdo do seu tópico..." 
}: QuickPostEditorProps) => {
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
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
    setContent(e.target.value);
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
    
    setContent(newContent);
    
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
      'list': '\\n- $$',
      'ordered-list': '\\n1. $$',
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
      // Quebras de linha
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
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
              dangerouslySetInnerHTML={createSafeHTML(renderMarkdown(content))}
            />
          ) : (
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleTextareaChange}
              rows={10}
              className="min-h-[200px] resize-none leading-relaxed"
            />
          )}
        </div>
        
        {isUploading && (
          <div className="text-sm text-muted-foreground">
            Fazendo upload da imagem...
          </div>
        )}
      </div>
    </Card>
  );
};
