
import { useState, useEffect } from "react";
import { Loader2, Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createStoragePublicPolicy, uploadFileWithFallback } from "@/lib/supabase/storage";

interface FileUploadProps {
  initialValue?: string;
  onUploadComplete: (url: string, fileType: string | null, fileName: string | null, fileSize: number | null) => void;
  bucketName: string;
  folderPath?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const FileUpload = ({
  initialValue = "",
  onUploadComplete,
  bucketName,
  folderPath = "",
  acceptedFileTypes = "*/*",
  maxSizeMB = 25, // 25MB default
  disabled = false
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string>(initialValue);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<"checking" | "ready" | "error">("checking");
  
  // Verificar status do bucket ao carregar o componente
  useEffect(() => {
    checkBucketStatus();
  }, [bucketName]);
  
  // Função para verificar o status do bucket
  const checkBucketStatus = async () => {
    try {
      setBucketStatus("checking");
      const result = await createStoragePublicPolicy(bucketName);
      
      if (result.success) {
        setBucketStatus("ready");
      } else {
        console.warn(`Problema com bucket ${bucketName}:`, result.message);
        setBucketStatus("error");
      }
    } catch (error) {
      console.error("Erro ao verificar bucket:", error);
      setBucketStatus("error");
    }
  };
  
  // Extrair nome do arquivo da URL
  const getFileNameFromURL = (url: string): string => {
    if (!url) return "";
    
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName);
    } catch (e) {
      return "arquivo";
    }
  };
  
  // Remover arquivo
  const handleRemoveFile = () => {
    setFile(null);
    setFileURL("");
    onUploadComplete("", null, null, null);
  };
  
  // Upload do arquivo
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    // Verificar tamanho do arquivo
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    if (selectedFile.size > maxSize) {
      setError(`O arquivo excede o tamanho máximo de ${maxSizeMB}MB.`);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Verificar status do bucket novamente antes do upload
      if (bucketStatus !== "ready") {
        await checkBucketStatus();
      }
      
      // Fazer upload usando a função com fallback
      const result = await uploadFileWithFallback(
        selectedFile,
        bucketName,
        folderPath,
        setUploadProgress
      );
      
      // Atualizar URL e informar conclusão
      setFileURL(result.publicUrl);
      onUploadComplete(
        result.publicUrl,
        selectedFile.type,
        selectedFile.name,
        selectedFile.size
      );
      
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setError(`Falha no upload: ${error.message || "Erro desconhecido"}`);
      toast.error("Falha ao enviar o arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };
  
  // Formatar tamanho do arquivo
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  return (
    <div className="space-y-4">
      {fileURL ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center p-3 bg-muted/50 border rounded-md">
            <File className="h-8 w-8 text-blue-500 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getFileNameFromURL(fileURL)}</p>
              <a href={fileURL} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                Visualizar arquivo
              </a>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="text-destructive hover:text-destructive/90"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover arquivo</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center border-2 border-dashed border-input rounded-lg p-6 transition-colors hover:border-primary">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center space-y-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Enviando...</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Clique para selecionar um arquivo ou<br />
                    arraste e solte aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {acceptedFileTypes === "*/*" 
                      ? `Qualquer tipo de arquivo (max. ${maxSizeMB}MB)`
                      : `${acceptedFileTypes.replace(/\*/g, 'Todos')} (max. ${maxSizeMB}MB)`}
                  </p>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                disabled={disabled || uploading}
              />
            </label>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress}% concluído
              </p>
            </div>
          )}
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          {file && !fileURL && !uploading && (
            <div className="text-sm flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground text-xs">({formatFileSize(file.size)})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
