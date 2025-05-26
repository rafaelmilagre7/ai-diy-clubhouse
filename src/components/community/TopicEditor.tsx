
import React, { useState } from "react";
import { Bold, Italic, List, ListOrdered, Link, Code, Quote, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

interface TopicEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TopicEditor({ content, onChange, placeholder = "Conteúdo..." }: TopicEditorProps) {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const insertFormatting = (format: string, placeholder?: string) => {
    const textarea = document.querySelector('textarea[data-topic-editor="true"]') as HTMLTextAreaElement;
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

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Inserir a imagem no formato markdown
      const imageMarkdown = `\n![Imagem](${data.publicUrl})\n`;
      const textarea = document.querySelector('textarea[data-topic-editor="true"]') as HTMLTextAreaElement;
      
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
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted pl-4 italic">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^1\. (.+)$/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-viverblue underline" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded" />')
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*?<\/li>(?:\s*<br \/>\s*<li>.*?<\/li>)*)/g, '<ul class="list-disc list-inside">$1</ul>');
    html = html.replace(/<br \/>\s*<\/ul>/g, '</ul>');
    html = html.replace(/<ul[^>]*>\s*<br \/>/g, '<ul class="list-disc list-inside">');

    return html;
  };

  return (
    <div className="border-0">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('bold')}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('italic')}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('list')}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('link')}
          title="Inserir link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('code')}
          title="Código inline"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertFormatting('quote')}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={triggerImageUpload}
          title="Adicionar imagem"
        >
          <Image className="h-4 w-4" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Button>
      </div>
      
      <Textarea
        data-topic-editor="true"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] max-h-[500px] resize-none border-0 focus:ring-0 rounded-none"
      />
    </div>
  );
}
