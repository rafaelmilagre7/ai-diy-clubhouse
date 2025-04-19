
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadControlsProps {
  uploading: boolean;
  buttonText: string;
  onButtonClick: () => void;
  fileName: string | null;
  error: string | null;
}

export const UploadControls = ({
  uploading,
  buttonText,
  onButtonClick,
  fileName,
  error
}: UploadControlsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className={`w-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={uploading}
        onClick={onButtonClick}
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4 animate-pulse" />
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {buttonText}
          </span>
        )}
      </Button>

      {fileName && !error && (
        <p className="text-sm text-muted-foreground">
          Arquivo selecionado: {fileName}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
