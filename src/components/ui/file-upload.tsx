
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "./file/FileInput";
import { UploadButton } from "./file/UploadButton";
import { FilePreview } from "./file/FilePreview";
import { uploadFileToStorage } from "./file/uploadUtils";

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (filePath: string, fileName: string) => void;
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
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    
    // Verificar tamanho do arquivo
    if (selectedFile.size > maxSize * 1024 * 1024) {
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
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const result = await uploadFileToStorage(
        file, 
        bucketName, 
        folder,
        (progress) => setUploadProgress(progress)
      );

      // Notificar o componente pai que o upload foi concluído
      onUploadComplete(result.publicUrl, result.fileName);
      
      toast({
        title: "Upload concluído",
        description: "O arquivo foi enviado com sucesso.",
      });
      
      // Limpar o campo de arquivo após o upload bem-sucedido
      // setFile(null);
      // Manter o preview para mostrar a imagem que foi enviada
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
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
      
      {filePreview && (
        <FilePreview 
          filePreview={filePreview} 
          uploadProgress={uploadProgress} 
        />
      )}
    </div>
  );
};
