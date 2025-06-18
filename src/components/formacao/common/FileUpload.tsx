
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadFileWithFallback, ensureBucketExists } from "@/lib/supabase/storage";
import { Upload, Loader2, File, X, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_BUCKETS, MAX_UPLOAD_SIZES } from "@/lib/supabase/config";

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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [bucketReady, setBucketReady] = useState(false);

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

  // Verificar se o bucket está pronto ao inicializar
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const bucketExists = await ensureBucketExists(bucketName);
        setBucketReady(bucketExists);
        if (!bucketExists) {
          setError(`Bucket ${bucketName} não pôde ser configurado. Usando bucket alternativo.`);
        }
      } catch (error) {
        console.error("Erro ao verificar bucket:", error);
        setBucketReady(true); // Continuar mesmo com erro
      }
    };
    
    checkBucket();
  }, [bucketName]);

  const uploadFile = async (file: File, attempt: number = 1) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Validar tamanho do arquivo
      const maxSize = MAX_UPLOAD_SIZES.DOCUMENT * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${MAX_UPLOAD_SIZES.DOCUMENT}MB`);
      }
      
      console.log(`Tentativa ${attempt} de upload para bucket: ${bucketName}`);
      
      // Upload com mecanismo de fallback aprimorado
      const result = await uploadFileWithFallback(
        file,
        bucketName,
        folderPath,
        (progress) => setUploadProgress(progress),
        STORAGE_BUCKETS.LEARNING_MATERIALS // Sempre usar como fallback
      );
      
      if ('error' in result) {
        throw result.error;
      }
      
      const successResult = result as { publicUrl: string; path: string; error: null };
      
      setFileName(file.name);
      onChange(successResult.publicUrl, file.type, file.size);
      setRetryCount(0);
      
      toast.success("Upload realizado com sucesso!");
      
    } catch (error: any) {
      console.error(`Erro no upload (tentativa ${attempt}):`, error);
      
      // Tentar novamente até 3 vezes
      if (attempt < 3 && !error.message?.includes("muito grande")) {
        setRetryCount(attempt);
        toast.warning(`Tentativa ${attempt} falhou. Tentando novamente...`);
        setTimeout(() => {
          uploadFile(file, attempt + 1);
        }, 1000 * attempt); // Delay progressivo
        return;
      }
      
      setError(error.message || "Erro ao fazer upload do arquivo");
      toast.error(`Erro no upload após ${attempt} tentativas: ${error.message}`);
    } finally {
      if (retryCount === 0) {
        setUploading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setRetryCount(0);
    uploadFile(file);
  };

  const handleRemoveFile = () => {
    onChange("", undefined, undefined);
    setFileName(null);
    setError(null);
    setRetryCount(0);
  };

  const handleRetry = () => {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      setRetryCount(0);
      uploadFile(fileInput.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {retryCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              className="h-6 px-2 text-destructive hover:text-destructive"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar Novamente
            </Button>
          )}
        </div>
      )}

      {retryCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-3 rounded-md flex items-center space-x-2 text-sm text-orange-700">
          <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          <span>Tentativa {retryCount} de 3... ({uploadProgress}%)</span>
        </div>
      )}

      {!value || !fileName ? (
        <div className="flex items-center justify-center w-full">
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
              "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
              "border-gray-300 dark:border-gray-600",
              !bucketReady && "opacity-50"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fazendo upload... {uploadProgress}%
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Tentativa {retryCount} de 3
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tamanho máximo: {MAX_UPLOAD_SIZES.DOCUMENT}MB
                  </p>
                  {!bucketReady && (
                    <p className="text-xs text-orange-600 mt-1">
                      Configurando armazenamento...
                    </p>
                  )}
                </>
              )}
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || !bucketReady}
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
