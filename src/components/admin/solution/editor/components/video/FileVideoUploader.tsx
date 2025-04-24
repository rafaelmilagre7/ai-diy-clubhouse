
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";

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
    <label htmlFor="video-upload" className="cursor-pointer">
      <Input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={onFileChange}
        className="hidden"
        disabled={isUploading || disabled}
      />
      <Button size="sm" asChild disabled={disabled}>
        <span>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress.toFixed(0)}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload de Vídeo
            </>
          )}
        </span>
      </Button>
    </label>
  );
};

export default FileVideoUploader;
