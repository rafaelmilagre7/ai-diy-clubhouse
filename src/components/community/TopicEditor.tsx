
import React from "react";
import { Bold, Italic, List, ListOrdered, Link, Code, Quote, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const editorRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upload de imagens");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 5MB");
      return;
    }

    try {
      // Generate a unique filename to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `forum_images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Insert the image into the editor
      const imageUrl = data.publicUrl;
      execCommand('insertHTML', `<img src="${imageUrl}" alt="Uploaded image" class="max-w-full h-auto my-2 rounded" />`);

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

  return (
    <div className="border-0">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('bold')}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('italic')}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertUnorderedList')}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertOrderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const url = prompt('Digite a URL do link:');
            if (url) {
              execCommand('createLink', url);
            }
          }}
          title="Inserir link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('formatBlock', '<pre>')}
          title="Bloco de código"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
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
      
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] max-h-[500px] overflow-y-auto p-3 focus:outline-none"
        onInput={updateContent}
        dangerouslySetInnerHTML={{ __html: content }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
