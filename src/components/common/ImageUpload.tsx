
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { uploadFileToStorage } from "@/components/ui/file/uploadUtils";
import { useImageURL } from "@/hooks/useImageURL";
import { ImagePlus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  bucketName: string;
  folderPath: string;
  enableOptimization?: boolean;
  maxSizeMB?: number;
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath,
  enableOptimization = true,
  maxSizeMB = 10
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizedUrl, setOptimizedUrl] = useState<string>(value || '');
  const [error, setError] = useState<string | null>(null);
  const { optimizeImageURL } = useImageURL();
  const { toast } = useToast();

  // Otimizar URL quando value mudar
  useEffect(() => {
    if (enableOptimization && value) {
      optimizeImageURL(value, { priority: 'normal' })
        .then(url => {
          setOptimizedUrl(url);
        })
        .catch(error => {
          console.warn('[ImageUpload] Erro na otimização:', error);
          setOptimizedUrl(value);
        });
    } else {
      setOptimizedUrl(value || '');
    }
  }, [value, enableOptimization, optimizeImageURL]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecione apenas arquivos de imagem");
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`A imagem é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é ${maxSizeMB}MB.`);
      toast({
        title: "Arquivo muito grande",
        description: `A imagem excede o tamanho máximo de ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}`);
      
      const result = await uploadFileToStorage(
        file,
        bucketName,
        folderPath,
        (progress) => {
          setProgress(Math.round(progress));
        }
      );

      console.log("Upload bem-sucedido:", result);
      
      onChange(result.publicUrl);
      
      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      const errorMessage = error.message || "Não foi possível enviar a imagem. Tente novamente.";
      setError(errorMessage);
      toast({
        title: "Falha no upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setOptimizedUrl("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {optimizedUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <img
            src={optimizedUrl}
            alt="Imagem de capa"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (optimizedUrl !== value && value) {
                target.src = value;
              } else {
                target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
                setError("Não foi possível carregar a imagem.");
              }
              console.error("Erro ao carregar imagem:", optimizedUrl);
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
              <span className="text-xs text-muted-foreground">
                Tamanho máximo: {maxSizeMB}MB
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
