
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, X, FileIcon, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
      
      // Criar um nome de arquivo único baseado no timestamp e nome original
      const timestamp = new Date().getTime();
      const fileExt = file.name.split(".").pop();
      const filePath = folder 
        ? `${folder}/${timestamp}-${file.name}` 
        : `${timestamp}-${file.name}`;

      // Upload do arquivo usando o client do Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: true,
          // Fix: Remove onUploadProgress property
        });

      if (error) {
        throw error;
      }

      // Listen for upload progress using the upload task
      const uploadTask = supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });
        
      // Manually update progress in intervals if needed
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 100));
      }, 300);
      
      const { data: uploadData, error: uploadError } = await uploadTask;
      
      clearInterval(interval);
      setUploadProgress(100);
      
      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

      // Notificar o componente pai que o upload foi concluído
      onUploadComplete(publicUrl, file.name);
      
      toast({
        title: "Upload concluído",
        description: "O arquivo foi enviado com sucesso.",
      });
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
      {fieldLabel && (
        <label className="block text-sm font-medium text-gray-700">
          {fieldLabel}
        </label>
      )}
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className={`cursor-pointer ${file ? 'file:hidden' : ''}`}
            disabled={uploading}
          />
          {file && (
            <div className="absolute inset-0 flex items-center">
              <div className="bg-muted rounded px-3 py-2 w-full flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={clearFile} 
                  className="p-1 hover:bg-gray-200 rounded-full"
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          type="button"
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="shrink-0"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadProgress}%
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
      
      {filePreview && (
        <div className="mt-2 relative w-full max-w-xs">
          <img 
            src={filePreview} 
            alt="Preview" 
            className="rounded border max-h-40 object-contain" 
          />
          {uploadProgress === 100 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
