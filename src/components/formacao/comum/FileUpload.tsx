import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, File } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createStoragePublicPolicy } from "@/lib/supabase/storage";
import { toast } from "sonner";

interface FileUploadProps {
  bucketName?: string;
  folder?: string;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => Promise<void>;
  accept?: string;
  buttonText?: string;
  fieldLabel?: string;
  disabled?: boolean;
  maxSize?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName = "learning_resources",
  folder = "",
  onUploadComplete,
  accept = "*",
  buttonText = "Upload de Arquivo",
  fieldLabel = "Selecione um arquivo",
  disabled = false,
  maxSize = 20
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (em MB)
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
      toast.error(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Verificar se o bucket existe e criar se necessário
      await createStoragePublicPolicy(bucketName);

      // Criar um nome de arquivo único
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${random}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error("Erro ao fazer upload:", error);
        setUploadError(`Erro no upload: ${error.message}`);
        toast.error(`Erro no upload: ${error.message}`);
        return;
      }

      // Obter a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      // Chamar a função de callback com a URL e o nome do arquivo
      await onUploadComplete(publicUrlData.publicUrl, file.name, file.size);
      toast.success("Upload concluído com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setUploadError(`Erro no upload: ${error.message || "Ocorreu um erro ao fazer upload."}`);
      toast.error(`Erro no upload: ${error.message || "Ocorreu um erro ao fazer upload."}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Resetar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="w-full h-32 flex flex-col gap-2 justify-center items-center border-dashed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Fazendo upload... {uploadProgress}%</span>
          </>
        ) : (
          <>
            <File className="h-6 w-6" />
            <span className="text-lg">{buttonText}</span>
            <span className="text-sm text-muted-foreground">{fieldLabel}</span>
          </>
        )}
      </Button>

      {uploadError && (
        <div className="text-red-500 text-sm">{uploadError}</div>
      )}

      {isUploading && (
        <Progress value={uploadProgress} className="h-2" />
      )}
    </div>
  );
};
