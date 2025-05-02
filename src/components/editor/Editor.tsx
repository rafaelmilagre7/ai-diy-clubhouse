
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface EditorProps {
  value: any;
  onChange: (value: any) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [content, setContent] = useState<string>('');

  // Inicializar o conteúdo quando o valor mudar
  useEffect(() => {
    if (value) {
      try {
        // Se o valor for um objeto, tenta formatar como JSON
        if (typeof value === 'object') {
          setContent(JSON.stringify(value, null, 2));
        } else {
          setContent(String(value));
        }
      } catch (error) {
        console.error("Erro ao processar conteúdo:", error);
        setContent('');
      }
    } else {
      setContent('');
    }
  }, [value]);

  // Atualizar o valor quando o conteúdo mudar
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    try {
      // Tentar parsear como JSON
      const jsonContent = newContent.trim() ? JSON.parse(newContent) : {};
      onChange(jsonContent);
    } catch (error) {
      // Se não for JSON válido, apenas passa o texto
      onChange(newContent);
    }
  };

  return (
    <div className="w-full border rounded-md">
      <Textarea
        className="min-h-[300px] font-mono resize-y"
        value={content}
        onChange={handleChange}
        placeholder="Insira o conteúdo aqui..."
      />
      <div className="p-2 bg-muted text-xs text-muted-foreground">
        Editor de conteúdo em formato JSON
      </div>
    </div>
  );
};
