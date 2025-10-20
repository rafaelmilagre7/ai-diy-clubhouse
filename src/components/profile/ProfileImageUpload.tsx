
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { Upload, Camera, X } from 'lucide-react';
import { getInitials } from '@/utils/user';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  userName?: string | null;
  userId?: string;
  onImageUpdate: (imageUrl: string) => void;
  disabled?: boolean;
}

export const ProfileImageUpload = ({ 
  currentImageUrl, 
  userName, 
  userId,
  onImageUpdate, 
  disabled = false 
}: ProfileImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    uploadFile, 
    isUploading, 
    progress, 
    error, 
    clearError 
  } = useUnifiedFileUpload({
    bucketName: 'profile-pictures',
    folder: userId,
    onUploadComplete: (url) => {
      setPreviewUrl(url);
      onImageUpdate(url);
    },
    onUploadError: (error) => {
      console.error('Erro no upload da imagem:', error);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearError();

    // Criar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    uploadFile(file);
  };

  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (disabled || isUploading) return;
    setPreviewUrl(null);
    onImageUpdate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-md">
      <div className="relative">
        <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback className="text-xl bg-muted">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="text-white text-sm font-medium">
              {progress}%
            </div>
          </div>
        )}
        
        {previewUrl && !isUploading && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 animate-pulse" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              <span>{previewUrl ? 'Alterar Foto' : 'Adicionar Foto'}</span>
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG, WebP ou GIF<br />
          Máximo 2MB
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive text-center">
          {error}
        </div>
      )}
    </div>
  );
};
