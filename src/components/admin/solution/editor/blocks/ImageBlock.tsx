
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Image, LinkIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedFileUpload } from "@/hooks/useUnifiedFileUpload";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

interface ImageBlockProps {
  data: {
    url: string;
    caption?: string;
    alt?: string;
  };
  onChange: (data: any) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { uploadFile, isUploading, progress } = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.SOLUTION_FILES,
    folder: "content_images",
    onUploadComplete: (url, fileName) => {
      console.log('[IMAGE_BLOCK] Upload concluído:', url);
      onChange({ 
        ...data, 
        url: url,
        alt: data.alt || fileName
      });
      
      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso."
      });
    },
    onUploadError: (error) => {
      console.error('[IMAGE_BLOCK] Erro no upload:', error);
      toast({
        title: "Erro ao fazer upload",
        description: error || "Ocorreu um erro ao tentar enviar a imagem.",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }
    
    console.log('[IMAGE_BLOCK] Iniciando upload:', file.name);
    await uploadFile(file);
  };

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
        <div className="relative">
          <Button 
            type="button" 
            variant="outline" 
            disabled={isUploading}
            className="shrink-0"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                {progress}%
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Button>
        </div>
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
          <p className="text-sm">Insira uma URL ou faça upload de uma imagem</p>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
