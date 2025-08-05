
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFileWithFallback } from "@/lib/supabase/storage";
import { ImagePlus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { STORAGE_BUCKETS, MAX_UPLOAD_SIZES } from "@/lib/supabase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
  bucketName: string;
  folderPath: string;
  maxSizeMB?: number; // Tamanho máximo em MB (opcional)
  disabled?: boolean;
}

export const ImageUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath,
  maxSizeMB = 5, // 5MB padrão para imagens
  disabled = false
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      setError("Por favor, selecione apenas arquivos de imagem");
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo (usando o limite especificado nos props)
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    if (file.size > maxSize) {
      setError(`A imagem é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é ${maxSizeMB}MB.`);
      toast({
        title: "Arquivo muito grande",
        description: `A imagem excede o tamanho máximo de ${maxSizeMB}MB. Por favor, selecione uma imagem menor.`,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}`);
      
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      const uploadResult = await uploadFileWithFallback(
        file,
        bucketName,
        filePath,
        (progress) => {
          setProgress(Math.round(progress));
        },
        STORAGE_BUCKETS.FALLBACK // Usando o bucket de fallback definido nas constantes
      );

      // Verificar se houve erro no upload
      if ('error' in uploadResult) {
        console.error("Erro no upload:", uploadResult.error);
        throw uploadResult.error;
      }
      
      // Sucesso - uploadResult agora é garantidamente do tipo success
      const successResult = uploadResult as { publicUrl: string; path: string; error: null };
      console.log("Upload bem-sucedido:", successResult);
      onChange(successResult.publicUrl);
      
      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setError(error.message || "Não foi possível enviar a imagem. Tente novamente.");
      toast({
        title: "Falha no upload",
        description: error.message || "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
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
      
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <img
            src={value}
            alt="Imagem de capa"
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/600x400?text=Imagem+não+encontrada";
              console.error("Erro ao carregar imagem:", value);
              setError("Não foi possível carregar a imagem. O arquivo pode não existir mais.");
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
            disabled={disabled}
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
        disabled={uploading || disabled}
        className="hidden"
        id="image-upload"
      />
      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || disabled}
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
