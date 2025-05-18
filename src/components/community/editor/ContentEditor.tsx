
import React from "react";
import { Bold, Italic, List, ListOrdered, Link, Code, Quote, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorState } from "@/hooks/useEditorState";
import { useEditorCommands } from "@/hooks/useEditorCommands";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ContentEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  toolbarClassName?: string;
  editorClassName?: string;
}

export function ContentEditor({
  content = '',
  onChange,
  placeholder = 'Escreva aqui o conteúdo...',
  minHeight = '200px',
  maxHeight = '500px',
  className = '',
  toolbarClassName = '',
  editorClassName = ''
}: ContentEditorProps) {
  const {
    isEmpty,
    editorRef,
    updateContent,
    getContent
  } = useEditorState({ initialContent: content, onChange, placeholder });

  const { 
    formatBold, 
    formatItalic, 
    formatUnorderedList, 
    formatOrderedList, 
    formatLink, 
    formatCodeBlock, 
    formatQuote,
    insertHTML
  } = useEditorCommands({ 
    getContent, 
    updateContent 
  });

  const {
    isUploading,
    fileInputRef,
    triggerFileInput,
    handleFileChange
  } = useImageUpload({
    onSuccess: (imageUrl) => {
      insertHTML(`<img src="${imageUrl}" alt="Imagem enviada" class="max-w-full h-auto my-2 rounded" />`);
    }
  });

  return (
    <div className={`border-0 ${className}`}>
      <div className={`flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20 ${toolbarClassName}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatBold}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatItalic}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={formatUnorderedList}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatOrderedList}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatLink}
          title="Inserir link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatCodeBlock}
          title="Bloco de código"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={formatQuote}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={triggerFileInput}
          title="Adicionar imagem"
          disabled={isUploading}
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
      
      <div className="relative" style={{ minHeight, maxHeight }}>
        <div
          ref={editorRef}
          contentEditable
          className={`overflow-y-auto p-3 focus:outline-none ${editorClassName}`}
          style={{ minHeight, maxHeight }}
          onInput={updateContent}
          dangerouslySetInnerHTML={{ __html: content }}
          data-placeholder={placeholder}
        />
        {isEmpty && (
          <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
