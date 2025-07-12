
import React, { useState, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Link, Code, Quote, Image, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSafeHTML } from '@/utils/htmlSanitizer';

interface VisualTopicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function VisualTopicEditor({ content, onChange, placeholder = "Conteúdo..." }: VisualTopicEditorProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<string>("split");

  const insertFormatting = (format: string, placeholder?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || placeholder || 'texto em negrito'}**`;
        cursorOffset = selectedText ? 0 : newText.length - 2;
        break;
      case 'italic':
        newText = `*${selectedText || placeholder || 'texto em itálico'}*`;
        cursorOffset = selectedText ? 0 : newText.length - 1;
        break;
      case 'list':
        newText = `\n- ${selectedText || placeholder || 'item da lista'}`;
        cursorOffset = selectedText ? 0 : newText.length;
        break;
      case 'orderedList':
        newText = `\n1. ${selectedText || placeholder || 'item numerado'}`;
        cursorOffset = selectedText ? 0 : newText.length;
        break;
      case 'code':
        newText = `\`${selectedText || placeholder || 'código'}\``;
        cursorOffset = selectedText ? 0 : newText.length - 1;
        break;
      case 'quote':
        newText = `\n> ${selectedText || placeholder || 'citação'}`;
        cursorOffset = selectedText ? 0 : newText.length;
        break;
      case 'link':
        const url = prompt('Digite a URL do link:');
        if (url) {
          newText = `[${selectedText || 'texto do link'}](${url})`;
          cursorOffset = selectedText ? 0 : newText.indexOf(']') - newText.indexOf('[') - 1;
        }
        break;
      default:
        return;
    }

    if (format === 'link' && !newText) return;

    const newContent = content.substring(0, start) + newText + content.substring(end);
    onChange(newContent);

    // Restaurar cursor
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + newText.length, start + newText.length);
      } else {
        textarea.setSelectionRange(start + newText.length - cursorOffset, start + newText.length - cursorOffset);
      }
    }, 0);
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upload de imagens");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 5MB");
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `forum_images/${fileName}`;

      console.log("Fazendo upload da imagem:", { fileName, filePath });

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      console.log("URL gerada:", data.publicUrl);

      // Inserir a imagem no formato markdown
      const imageMarkdown = `\n![Imagem](${data.publicUrl})\n`;
      const textarea = textareaRef.current;
      
      if (textarea) {
        const start = textarea.selectionStart;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(start);
        onChange(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      }

      toast.success("Imagem adicionada com sucesso!");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(`Erro ao fazer upload da imagem: ${error.message || 'Desconhecido'}`);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Converter markdown básico para HTML para preview
  const convertMarkdownToHtml = (markdown: string) => {
    console.log("Convertendo markdown:", markdown);
    
    let html = markdown
      // Primeiro processar imagens antes de outros elementos
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        console.log("Processando imagem:", { alt, src, match });
        return `<img src="${src}" alt="${alt}" class="max-w-full h-auto my-4 rounded shadow-sm block" style="max-height: 400px; object-fit: contain;" onError="console.error('Erro ao carregar imagem:', '${src}')" />`;
      })
      // Negrito
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Itálico
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Código inline
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Citações
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-viverblue pl-4 italic my-2 text-muted-foreground">$1</blockquote>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-viverblue underline hover:text-viverblue/80" target="_blank" rel="noopener noreferrer">$1</a>')
      // Quebras de linha duplas para parágrafos
      .replace(/\n\n/g, '</p><p class="mb-3">')
      // Quebras de linha simples
      .replace(/\n/g, '<br />');

    // Listas não ordenadas
    const listMatches = html.match(/^- (.+)$/gm);
    if (listMatches) {
      const listItems = listMatches.map(item => 
        `<li class="ml-4">${item.replace(/^- /, '')}</li>`
      ).join('');
      html = html.replace(/^- .+$/gm, '').replace(/(<br \/>\s*){2,}/g, '') + 
             `<ul class="list-disc list-inside space-y-1 my-3">${listItems}</ul>`;
    }

    // Listas ordenadas
    const orderedListMatches = html.match(/^\d+\. (.+)$/gm);
    if (orderedListMatches) {
      const orderedListItems = orderedListMatches.map(item => 
        `<li class="ml-4">${item.replace(/^\d+\. /, '')}</li>`
      ).join('');
      html = html.replace(/^\d+\. .+$/gm, '').replace(/(<br \/>\s*){2,}/g, '') + 
             `<ol class="list-decimal list-inside space-y-1 my-3">${orderedListItems}</ol>`;
    }

    // Envolver em parágrafo se não começar com tag
    if (html && !html.startsWith('<')) {
      html = '<p class="mb-3">' + html + '</p>';
    }

    console.log("HTML resultante:", html);
    return html;
  };

  const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-viverblue/10"
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  // Preview com tratamento de erro para imagens
  const PreviewContent = ({ htmlContent }: { htmlContent: string }) => {
    if (!htmlContent) {
      return (
        <div className="text-muted-foreground italic flex items-center justify-center h-full">
          Preview aparecerá aqui...
        </div>
      );
    }

    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={createSafeHTML(htmlContent)}
        style={{
          // Garantir que imagens sejam responsivas
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    );
  };

  const processedHtml = convertMarkdownToHtml(content);

  return (
    <div className="border rounded-md overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton icon={Bold} onClick={() => insertFormatting('bold')} title="Negrito" />
            <ToolbarButton icon={Italic} onClick={() => insertFormatting('italic')} title="Itálico" />
            <ToolbarButton icon={List} onClick={() => insertFormatting('list')} title="Lista com marcadores" />
            <ToolbarButton icon={ListOrdered} onClick={() => insertFormatting('orderedList')} title="Lista numerada" />
            <ToolbarButton icon={Link} onClick={() => insertFormatting('link')} title="Inserir link" />
            <ToolbarButton icon={Code} onClick={() => insertFormatting('code')} title="Código inline" />
            <ToolbarButton icon={Quote} onClick={() => insertFormatting('quote')} title="Citação" />
            <ToolbarButton icon={Image} onClick={triggerImageUpload} title="Adicionar imagem" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          <TabsList className="h-8">
            <TabsTrigger value="split" className="text-xs flex items-center gap-1">
              <Edit className="h-3 w-3" />
              <Eye className="h-3 w-3" />
              Split
            </TabsTrigger>
            <TabsTrigger value="editor" className="text-xs flex items-center gap-1">
              <Edit className="h-3 w-3" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="split" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px]">
            <div className="border-r">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[300px] max-h-[500px] resize-none border-0 focus:ring-0 rounded-none"
              />
            </div>
            <div className="p-4 bg-muted/10 overflow-auto">
              <PreviewContent htmlContent={processedHtml} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="editor" className="mt-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] max-h-[500px] resize-none border-0 focus:ring-0 rounded-none"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="p-4 min-h-[300px] overflow-auto">
            <PreviewContent htmlContent={processedHtml} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
