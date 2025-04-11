
import React from "react";
import { Input } from "@/components/ui/input";
import { Image, LinkIcon } from "lucide-react";

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          value={data.url}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="URL da imagem"
          className="flex-1"
        />
      </div>
      
      <Input
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Legenda (opcional)"
      />
      
      <Input
        value={data.alt || ''}
        onChange={(e) => onChange({ ...data, alt: e.target.value })}
        placeholder="Texto alternativo para acessibilidade"
      />
      
      {data.url ? (
        <div className="mt-4 border rounded-md overflow-hidden">
          <div className="max-h-[300px] overflow-hidden bg-slate-100 flex items-center justify-center">
            <img 
              src={data.url} 
              alt={data.alt || 'Preview'} 
              className="max-h-[300px] max-w-full object-contain mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
              }}
            />
          </div>
          
          {data.caption && (
            <div className="p-3 bg-slate-50 text-sm text-center text-slate-600">
              {data.caption}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 border rounded-md p-8 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
          <Image className="h-10 w-10 mb-2" />
          <p className="text-sm">Insira uma URL para visualizar a imagem</p>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
