import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogging } from "@/hooks/useLogging";
import { supabase } from "@/integrations/supabase/client";
import { validateImageUploadSecurity } from "@/utils/security/imageUploadSecurity";

interface ImageUploadImgBBProps {
  value: string | undefined;
  onChange: (url: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const ImageUploadImgBB = ({
  value,
  onChange,
  maxSizeMB = 5,
  disabled = false
}: ImageUploadImgBBProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logError } = useLogging();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de segurança robusta
    const securityCheck = validateImageUploadSecurity(file);
    
    if (!securityCheck.isSecure) {
      const errorMsg = [...securityCheck.errors, ...securityCheck.warnings].join('; ');
      setError(errorMsg);
      toast({
        title: "Arquivo rejeitado por segurança",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho do arquivo
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
    setProgress(10);

    try {
      console.log("📷 ImageUploadImgBB - Iniciando upload seguro via Edge Function");
      setProgress(30);

      // Criar FormData para a Edge Function segura
      const formData = new FormData();
      formData.append('image', file);
      
      setProgress(50);

      // Usar Edge Function segura ao invés de chave exposta
      const { data, error } = await supabase.functions.invoke('image-upload', {
        body: formData
      });

      setProgress(80);

      if (error) {
        throw new Error(error.message || 'Erro no upload da imagem');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha no upload da imagem');
      }
      
      console.log("📷 ImageUploadImgBB - Upload bem-sucedido via Edge Function:", data.data);
      
      // Usar a URL pública retornada pelo ImgBB via Edge Function
      const imageUrl = data.data.url || data.data.display_url;
      onChange(imageUrl);
      
      setProgress(100);
      
      toast({
        title: "Upload concluído",
        description: "A imagem foi enviada com sucesso via conexão segura.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("📷 ImageUploadImgBB - Erro no upload:", error);
      logError("secure_imgbb_upload_error", error);
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
              setError("Não foi possível carregar a imagem. O URL pode estar quebrado.");
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
        id="image-upload-imgbb"
      />
      {!value && !uploading && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading || disabled}
          onClick={() => document.getElementById("image-upload-imgbb")?.click()}
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