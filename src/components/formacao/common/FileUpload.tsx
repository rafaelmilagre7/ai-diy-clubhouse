import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadFileWithFallback } from "@/lib/supabase";
import { Upload, Loader2, File, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_SIZES } from "@/lib/supabase/config";

interface FileUploadProps {
  value: string;
  onChange: (value: string, fileType: string | undefined, fileSize: number | undefined) => void;
  bucketName: string;
  folderPath?: string;
  acceptedFileTypes?: string;
  disabled?: boolean;
}

export const FileUpload = ({ 
  value, 
  onChange, 
  bucketName, 
  folderPath = "",
  acceptedFileTypes = "*/*",
  disabled = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bucketReady, setBucketReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar status do bucket ao montar o componente
  useEffect(() => {
    const checkBucket = async () => {
      try {
        console.log(`Verificando bucket: ${bucketName}`);
        // Verificar se o bucket existe usando o Supabase API diretamente
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        setBucketReady(bucketExists);
        
        if (!bucketExists) {
          console.warn(`Bucket ${bucketName} não está pronto. Tentando criar...`);
          // Tentativa de criar o bucket via RPC
          const { data, error } = await supabase.rpc('create_storage_public_policy', {
            bucket_name: bucketName
          });
          
          if (error) {
            console.error("Erro ao criar bucket via RPC:", error);
            setError(`Não foi possível inicializar o bucket de armazenamento: ${error.message}`);
          } else {
            console.log("Bucket criado com sucesso via RPC:", data);
            setBucketReady(true);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar bucket:", error);
        setError("Erro ao verificar o bucket de armazenamento. Por favor, tente novamente.");
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
      setError(null);
      
      // Verificar se o bucket existe antes de fazer upload
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.warn(`Bucket ${bucketName} não encontrado, tentando criar...`);
        const { data, error } = await supabase.rpc('create_storage_public_policy', {
          bucket_name: bucketName
        });
        
        if (error) {
          throw new Error(`Não foi possível criar o bucket: ${error.message}`);
        }
      }
      
      // Upload com mecanismo de fallback aprimorado
      console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}`);
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const filePath = `${folderPath}/${Date.now()}-${file.name}`;
      
      // Upload do arquivo - corrigido para usar a API adequada sem onUploadProgress
      const uploadOptions = {
        cacheControl: '3600',
        upsert: true
      };
      
      // Use um evento personalizado para rastrear o progresso do upload
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentage);
        }
      });
      
      // Inicia o upload
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, uploadOptions);
      
      if (error) {
        throw error;
      }
      
      // Obter a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData?.publicUrl;
      
      if (!publicUrl) {
        throw new Error('Falha ao obter URL pública para o arquivo.');
      }
      
      setFileName(file.name);
      onChange(publicUrl, file.type, file.size);
      
      toast.success("Upload realizado com sucesso!");
      
    } catch (error: any) {
      console.error("Erro no upload de arquivo:", error);
      setError(error.message || "Erro ao fazer upload do arquivo");
      toast.error(error.message || "Erro ao fazer upload do arquivo. Tente novamente.");
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
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center space-x-2 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!value || !fileName ? (
        <div className="flex items-center justify-center w-full">
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
              "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
              "border-gray-300 dark:border-gray-600",
              disabled && "opacity-50 cursor-not-allowed"
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
                    Tamanho máximo recomendado: {MAX_UPLOAD_SIZES.DOCUMENT}MB
                  </p>
                </>
              )}
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading || disabled || !bucketReady}
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
            disabled={uploading || disabled}
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
