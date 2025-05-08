import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFileWithFallback } from "@/lib/supabase/storage";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucketName?: string;
  folderPath?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucketName = STORAGE_BUCKETS.COVER_IMAGES,
  folderPath = "images",
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado: ${file.type}. Use formatos como JPEG, PNG, GIF ou WebP.`);
      return;
    }

    // Validar tamanho (limite de 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      setError(`O arquivo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo é 5MB.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadFileWithFallback(
        file,
        bucketName,
        folderPath,
        (progress) => setUploadProgress(progress)
      );

      onChange(result.publicUrl);
      toast.success("Imagem enviada com sucesso");
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setError(`Erro no upload: ${error.message || "Tente novamente"}`);
      toast.error("Falha no upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="space-y-2">
          <img src={value} alt="Imagem" className="rounded-md" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onChange("")}
            disabled={uploading}
          >
            Remover Imagem
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            variant="outline"
            asChild
            disabled={uploading}
          >
            <label
              htmlFor="image-upload"
              className="cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando... {uploadProgress}%
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Selecionar Imagem
                </>
              )}
            </label>
          </Button>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/jpeg, image/png, image/gif, image/webp"
          />
          {uploading && (
            <Progress value={uploadProgress} className="h-2" />
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
