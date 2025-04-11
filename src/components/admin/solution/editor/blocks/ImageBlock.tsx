
import React from "react";
import { Input } from "@/components/ui/input";

interface ImageBlockProps {
  data: {
    url: string;
    caption?: string;
    alt?: string;
  };
  onChange: (data: any) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <Input
        value={data.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="URL da imagem"
      />
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
      <Input
        value={data.alt || ''}
        onChange={(e) => onChange({ alt: e.target.value })}
        placeholder="Texto alternativo para acessibilidade"
      />
      {data.url && (
        <div className="mt-2 border rounded p-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <img 
            src={data.url} 
            alt={data.alt || 'Preview'} 
            className="max-h-[200px] object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
