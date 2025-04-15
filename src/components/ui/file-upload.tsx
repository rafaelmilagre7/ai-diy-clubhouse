
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "./file/FileInput";
import { UploadButton } from "./file/UploadButton";
import { FilePreview } from "./file/FilePreview";
import { uploadFileToStorage } from "./file/uploadUtils";
import { Progress } from "./progress";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (filePath: string, fileName: string, fileSize: number) => void;
  accept?: string;
  maxSize?: number; // in MB
  buttonText?: string;
  fieldLabel?: string;
}

export const FileUpload = ({
  bucketName,
  folder = "",
  onUploadComplete,
  accept = "*",
  maxSize = 10, // default 10MB
  buttonText = "Fazer upload",
  fieldLabel = "Selecione um arquivo"
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    setError(null);
    
    // Verificar tamanho do arquivo
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`O arquivo excede o limite de ${maxSize}MB permitido.`);
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter menos de ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Criar preview para imagens
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      const result = await uploadFileToStorage(
        file, 
        bucketName, 
        folder,
        (progress) => setUploadProgress(progress)
      );

      // Notificar o componente pai que o upload foi concluído
      onUploadComplete(result.publicUrl, result.fileName, file.size);
      
      toast({
        title: "Upload concluído",
        description: "O arquivo foi enviado com sucesso.",
      });
      
      // Limpar o campo de arquivo após o upload bem-sucedido
      clearFile();
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      setError(error.message || "Ocorreu um erro ao tentar enviar o arquivo.");
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao tentar enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center gap-3">
        <FileInput
          file={file}
          onFileChange={handleFileChange}
          onClearFile={clearFile}
          accept={accept}
          uploading={uploading}
          fieldLabel={fieldLabel}
        />
        
        <UploadButton
          onClick={handleUpload}
          disabled={!file || uploading}
          uploading={uploading}
          uploadProgress={uploadProgress}
          buttonText={buttonText}
        />
      </div>
      
      {file && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{file.name}</span>
            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {filePreview && (
        <FilePreview 
          filePreview={filePreview} 
          uploadProgress={uploadProgress} 
        />
      )}
    </div>
  );
};
