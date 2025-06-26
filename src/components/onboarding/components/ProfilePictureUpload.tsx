
import React, { useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  userName?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  userName = 'Usuário',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const { toast } = useToast();

  const handleUploadComplete = async (url: string) => {
    try {
      setIsUploading(false);
      setPreviewUrl(url);
      onImageUpload(url);
      
      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao processar upload:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a foto de perfil.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    onImageUpload('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={previewUrl} alt={userName} />
          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemoveImage}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <FileUpload
          bucketName="PROFILE_IMAGES"
          folder="avatars"
          onUploadComplete={handleUploadComplete}
          accept="image/*"
          maxSize={5}
          buttonText={previewUrl ? "Alterar Foto" : "Adicionar Foto"}
          fieldLabel=""
        />
        
        <p className="text-xs text-gray-500 text-center">
          Formatos suportados: JPG, PNG, GIF (máx. 5MB)
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
