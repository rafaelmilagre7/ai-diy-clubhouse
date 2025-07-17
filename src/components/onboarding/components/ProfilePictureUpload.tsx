
import React from 'react';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/user';

interface ProfilePictureUploadProps {
  value?: string;
  onChange: (url: string) => void;
  userName?: string;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  value,
  onChange,
  userName
}) => {
  const handleRemove = () => {
    onChange('');
  };

  const handleUpload = (url: string) => {
    onChange(url);
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-200">
        Foto de Perfil (Opcional)
      </Label>
      
      <div className="flex flex-col items-center space-y-4">
        {value ? (
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={value} alt="Foto de perfil" />
              <AvatarFallback className="bg-viverblue/20 text-viverblue text-lg">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Avatar className="w-24 h-24 border-2 border-dashed border-white/20">
            <AvatarFallback className="bg-[#151823] text-slate-400">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
        )}

        {!value && (
          <FileUpload
            bucketName="profile_images"
            folder="avatars"
            onUploadComplete={handleUpload}
            accept="image/*"
            maxSize={5} // 5MB
            buttonText="Adicionar Foto"
            fieldLabel=""
          />
        )}
      </div>
      
      <p className="text-xs text-slate-400 text-center">
        Você pode adicionar ou alterar sua foto depois no perfil
      </p>
    </div>
  );
};
