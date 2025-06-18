
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadFileWithFallback, ensureBucketExists } from "@/lib/supabase/storage";
import { Upload, Loader2, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

interface FileUploadProps {
  value: string;
  onChange: (value: string, fileType: string | undefined, fileSize: number | undefined) => void;
  bucketName: string;
  folderPath?: string;
  acceptedFileTypes?: string;
}

export const FileUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath = "",
  acceptedFileTypes = "*/*"
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bucketReady, setBucketReady] = useState(false);

  // Verificar status do bucket ao montar o componente
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const isReady = await ensureBucketExists(bucketName);
        setBucketReady(isReady);
        
        if (!isReady) {
          console.warn(`Bucket ${bucketName} não está pronto. Algumas funcionalidades podem não estar disponíveis.`);
        }
      } catch (error) {
        console.error("Erro ao verificar bucket:", error);
      }
    };
    
    checkBucket();
  }, [bucketName]);

  // Extract filename from URL for display
  const getFileNameFromUrl = (url: string): string => {
    if (!url) return "";
    try {
      const pathParts = url.split("/");
      return decodeURIComponent(pathParts[pathParts.length - 1]);
    } catch (e) {
      console.error("Error parsing filename from URL:", e);
      return "Arquivo";
    }
  };

  // Set initial filename if URL exists
  useEffect(() => {
    if (value) {
      setFileName(getFileNameFromUrl(value));
    }
  }, [value]);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Upload com mecanismo de fallback
      const result = await uploadFileWithFallback(
        file,
        bucketName,
        folderPath,
        (progress) => setUploadProgress(progress),
        STORAGE_BUCKETS.FALLBACK // Usar bucket de fallback
      );
      
      // Verificar se há erro e tratar corretamente
      if ('error' in result) {
        throw result.error;
      }
      
      // Caso de sucesso - definindo uma variável com tipo explícito
      const successResult = result as { publicUrl: string; path: string; error: null };
      
      setFileName(file.name);
      onChange(successResult.publicUrl, file.type, file.size);
      
      toast.success("Upload realizado com sucesso!");
      
    } catch (error: any) {
      console.error("Erro no upload de arquivo:", error);
      toast.error("Erro ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    uploadFile(file);
  };

  const handleRemoveFile = () => {
    onChange("", undefined, undefined);
    setFileName(null);
  };

  return (
    <div className="space-y-4">
      {!value || !fileName ? (
        <div className="flex items-center justify-center w-full">
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
              "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
              "border-gray-300 dark:border-gray-600"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fazendo upload... {uploadProgress}%
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tamanho máximo recomendado: 10MB
                  </p>
                </>
              )}
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              accept={acceptedFileTypes}
            />
          </label>
        </div>
      ) : (
        <div className="flex items-center p-4 space-x-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <File className="h-10 w-10 flex-shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate dark:text-white">
              {fileName}
            </p>
            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
              Arquivo carregado com sucesso
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveFile}
            disabled={uploading}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remover arquivo</span>
          </Button>
        </div>
      )}
    </div>
  );
};
