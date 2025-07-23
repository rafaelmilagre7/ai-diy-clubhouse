import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Arquivo muito grande. Máximo 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      console.log('Fazendo upload da foto:', fileName);

      // Upload para o Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload da foto');
        return;
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      console.log('URL pública gerada:', publicUrl);

      // Criar preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Chamar onChange com a URL
      onChange(publicUrl);
      toast.success('Foto carregada com sucesso!');

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro inesperado ao carregar foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center">
        {/* Preview da foto */}
        <div className="relative">
          <div className={`w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50 ${
            preview ? 'border-solid border-primary' : ''
          }`}>
            {preview ? (
              <img
                src={preview}
                alt="Preview da foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          {/* Botão de remover */}
          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              onClick={handleRemovePhoto}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Carregando...' : preview ? 'Alterar foto' : 'Carregar foto'}
          </Button>
        </div>

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Dicas */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPG, PNG, GIF • Máximo 5MB
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Uma boa foto de perfil ajuda na conexão com outros membros
        </p>
      </div>
    </div>
  );
};