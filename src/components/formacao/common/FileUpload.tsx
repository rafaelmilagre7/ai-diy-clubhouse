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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo
    const maxSizeInBytes = maxSize * 1024 * 1024; // Converter MB para bytes
    if (file.size > maxSizeInBytes) {
      setUploadError(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Verificar se o bucket existe e criar se necessário
      await createStoragePublicPolicy(bucketName);
      
      // Gerar um nome de arquivo único
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error("Erro ao fazer upload:", error);
        setUploadError(`Erro no upload: ${error.message}`);
        return;
      }

      // Obter a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Chamar a função de callback com a URL e o nome do arquivo
      await onUploadComplete(publicUrlData.publicUrl, file.name, file.size);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setUploadError(`Erro no upload: ${error.message || "Ocorreu um erro ao tentar enviar o arquivo."}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        {fieldLabel}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {isUploading ? (
            <>
              <Loader2 className="mx-auto h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-gray-500">Enviando... {uploadProgress}%</p>
              <Progress value={uploadProgress} className="h-2" />
            </>
          ) : (
            <>
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>{buttonText}</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled}
                    ref={fileInputRef}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {accept === "*" ? "Todos os formatos de arquivo são permitidos" : `Formatos suportados: ${accept}`}
              </p>
              <p className="text-xs text-gray-500">
                Tamanho máximo: {maxSize}MB
              </p>
            </>
          )}
        </div>
      </div>
      {uploadError && (
        <div className="text-red-500 text-sm mt-2">{uploadError}</div>
      )}
    </div>
  );
};
