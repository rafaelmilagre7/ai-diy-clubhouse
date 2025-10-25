
import React, { useCallback, useState } from 'react';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';

interface DragDropImageZoneProps {
  onImageUpload: (url: string, fileName: string) => void;
  className?: string;
  disabled?: boolean;
}

export const DragDropImageZone: React.FC<DragDropImageZoneProps> = ({
  onImageUpload,
  className = '',
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const {
    uploadFile,
    isUploading,
    progress,
    error
  } = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.COMMUNITY_IMAGES,
    folder: 'topics',
    onUploadComplete: (url, fileName) => {
      onImageUpload(url, fileName);
    }
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      uploadFile(imageFile);
    }
  }, [disabled, isUploading, uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
    // Limpar o input
    e.target.value = '';
  }, [uploadFile]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-base
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        ${isUploading ? 'border-operational bg-operational/5' : ''}
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <div className="text-sm text-muted-foreground">
              Enviando imagem... {progress}%
            </div>
            {progress > 0 && (
              <div className="w-full max-w-xs bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-slow"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              {isDragOver ? (
                <Upload className="h-6 w-6 text-primary animate-bounce" />
              ) : (
                <Image className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                {isDragOver ? 'Solte a imagem aqui' : 'Adicionar imagem'}
              </div>
              <div className="text-xs text-muted-foreground">
                Arraste uma imagem ou clique para selecionar
              </div>
            </div>
          </>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
