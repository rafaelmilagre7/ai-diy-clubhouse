
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2, File, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  // Lista de buckets para tentar em ordem de preferência
  const fallbackBuckets = ["solution_files", "learning_materials", "documents"];

  // Verificar status do bucket ao montar o componente
  useEffect(() => {
    const checkBucket = async () => {
      try {
        setError(null);
        console.log(`Verificando bucket ${bucketName}...`);
        
        // Verificar se o bucket existe
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();
          
        if (bucketsError) {
          console.error("Erro ao listar buckets:", bucketsError);
          throw bucketsError;
        }
        
        // Se o bucket solicitado existe, usamos ele
        if (buckets?.some(b => b.name === bucketName)) {
          console.log(`Bucket ${bucketName} encontrado!`);
          setBucketReady(true);
          return;
        }
        
        // Se não, procuramos um bucket alternativo
        console.log(`Bucket ${bucketName} não encontrado, procurando alternativas...`);
        for (const fallbackBucket of fallbackBuckets) {
          if (buckets?.some(b => b.name === fallbackBucket)) {
            console.log(`Usando bucket alternativo: ${fallbackBucket}`);
            setBucketReady(true);
            return;
          }
        }
        
        // Tentar criar um bucket se nenhum estiver disponível
        try {
          console.log("Nenhum bucket encontrado, tentando criar...");
          const { data, error } = await supabase
            .storage
            .createBucket(bucketName, {
              public: true,
              fileSizeLimit: 104857600 // 100MB
            });
            
          if (error) {
            console.error("Erro ao criar bucket:", error);
            throw error;
          }
          
          console.log("Bucket criado com sucesso:", data);
          
          // Criar políticas de acesso público
          try {
            await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
            console.log("Políticas de acesso público criadas para o bucket");
          } catch (policyError) {
            console.error("Erro ao criar políticas de acesso:", policyError);
          }
          
          setBucketReady(true);
          return;
        } catch (createError) {
          console.error("Erro ao criar bucket:", createError);
        }
        
        setError("Nenhum bucket de armazenamento disponível. Entre em contato com o administrador do sistema.");
        setBucketReady(false);
      } catch (error) {
        console.error("Erro ao verificar buckets:", error);
        setError("Erro ao verificar armazenamento. Upload de arquivos pode não funcionar.");
        setBucketReady(false);
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
      
      // Lista de buckets para tentar
      const bucketsToTry = [bucketName, ...fallbackBuckets];
      let uploadSuccess = false;
      let uploadedUrl = "";
      
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const actualFolderPath = folderPath ? `${folderPath}` : "";
      
      // Tentar fazer upload em cada bucket até ter sucesso
      for (const currentBucket of bucketsToTry) {
        try {
          console.log(`Tentando fazer upload para o bucket: ${currentBucket}`);
          setUploadProgress(10);
          
          // Verificar se o bucket existe
          const { data: bucketExists, error: bucketCheckError } = await supabase
            .storage
            .getBucket(currentBucket);
            
          if (bucketCheckError) {
            console.log(`Bucket ${currentBucket} não existe ou não está acessível, pulando...`);
            continue;
          }
          
          setUploadProgress(30);
          
          // Fazer upload
          const filePath = actualFolderPath ? `${actualFolderPath}/${uniqueFileName}` : uniqueFileName;
          const { data, error } = await supabase.storage
            .from(currentBucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (error) {
            console.error(`Erro ao fazer upload para ${currentBucket}:`, error);
            continue;
          }
          
          setUploadProgress(70);
          
          // Obter URL pública
          const { data: publicUrlData } = supabase.storage
            .from(currentBucket)
            .getPublicUrl(filePath);
            
          if (!publicUrlData?.publicUrl) {
            console.error(`URL pública não disponível para ${currentBucket}`);
            continue;
          }
          
          uploadedUrl = publicUrlData.publicUrl;
          uploadSuccess = true;
          setUploadProgress(100);
          
          console.log(`Upload realizado com sucesso para ${currentBucket}:`, uploadedUrl);
          break;
        } catch (bucketError) {
          console.error(`Erro ao usar bucket ${currentBucket}:`, bucketError);
        }
      }
      
      if (!uploadSuccess) {
        throw new Error("Não foi possível fazer upload do arquivo em nenhum bucket disponível.");
      }
      
      setFileName(file.name);
      onChange(uploadedUrl, file.type, file.size);
      
      toast.success("Upload realizado com sucesso!");
      
    } catch (error: any) {
      console.error("Erro no upload de arquivo:", error);
      setError(error.message || "Erro ao fazer upload do arquivo.");
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
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!value || !fileName ? (
        <div className="flex items-center justify-center w-full">
          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
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
              disabled={uploading || disabled || (!bucketReady && !fallbackBuckets.length)}
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
          {!disabled && (
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
          )}
        </div>
      )}
    </div>
  );
};
