
import React from "react";
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
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center justify-center">
        <Upload className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-medium text-base mb-1">Upload de vídeo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Formatos suportados: MP4, WEBM, MOV (Máx: 100MB)
        </p>
      </div>
      
      <Input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={onFileChange}
        className="hidden"
        disabled={isUploading || disabled}
      />

      <label htmlFor="video-upload" className="cursor-pointer">
        <Button size="lg" disabled={disabled || isUploading} variant="outline" className="gap-2">
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
      </label>

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
