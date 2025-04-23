
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FileVideoUploaderProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  uploadProgress: number;
  disabled?: boolean;
}

const FileVideoUploader: React.FC<FileVideoUploaderProps> = ({
  onFileChange,
  isUploading,
  uploadProgress,
  disabled = false,
}) => {
  // Adicionando referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para acionar o clique no input quando o botão for clicado
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center justify-center">
        <Upload className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-medium text-base mb-1">Upload de vídeo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Formatos suportados: MP4, WEBM, MOV (Máx: 500MB)
        </p>
      </div>
      
      <Input
        id="video-upload"
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={onFileChange}
        className="hidden"
        disabled={isUploading || disabled}
      />

      <Button 
        size="lg" 
        disabled={disabled || isUploading} 
        variant="outline" 
        className="gap-2"
        onClick={handleButtonClick} // Usando função de clique aqui
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Selecionar arquivo
          </>
        )}
      </Button>

      {isUploading && (
        <div className="w-full mt-2 space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            {uploadProgress.toFixed(0)}% concluído
          </p>
        </div>
      )}
    </div>
  );
};

export default FileVideoUploader;
