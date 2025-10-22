import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { uploadFileToStorage } from "@/components/ui/file/uploadUtils";
import { useImageURL } from "@/hooks/useImageURL";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  bucketName: string;
  folderPath: string;
  enableOptimization?: boolean;
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath,
  enableOptimization = true 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedUrl, setOptimizedUrl] = useState<string>(value || '');
  const { optimizeImageURL } = useImageURL();
  const { toast } = useToast();

  // Otimizar URL quando value mudar
  useEffect(() => {
    if (enableOptimization && value) {
      optimizeImageURL(value, { priority: 'normal' })
        .then(url => {
          setOptimizedUrl(url);
        })
        .catch(() => {
          setOptimizedUrl(value);
        });
    } else {
      setOptimizedUrl(value || '');
    }
  }, [value, enableOptimization, optimizeImageURL]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFileToStorage(
        file,
        bucketName,
        folderPath,
        (progress) => {
          setProgress(Math.round(progress));
        }
      );

      // Chamar onChange com a URL original (não otimizada ainda)
      onChange(result.publicUrl);
      
      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Falha no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setOptimizedUrl("");
  };

  return (
    <div className="space-y-4">
      {optimizedUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <img
            src={optimizedUrl}
            alt="Imagem de capa"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Fallback para URL original se a otimizada falhar
              if (optimizedUrl !== value && value) {
                target.src = value;
              } else {
                target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Enviando... {progress}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para adicionar uma imagem de capa
              </span>
            </div>
          )}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      {!optimizedUrl && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById("image-upload")?.click()}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              Upload de Imagem
            </>
          )}
        </Button>
      )}
    </div>
  );
};
