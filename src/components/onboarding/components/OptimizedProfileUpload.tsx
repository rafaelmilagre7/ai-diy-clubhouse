import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/user';
import { uploadFileToSupabase } from '@/components/ui/file/services/supabase';
import { toast } from '@/hooks/use-toast';

interface OptimizedProfileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  userName?: string;
}

export const OptimizedProfileUpload: React.FC<OptimizedProfileUploadProps> = ({
  value,
  onChange,
  userName
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações básicas
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo deve ter no máximo 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Apenas imagens são permitidas');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('📤 [PROFILE-UPLOAD] Iniciando upload do perfil:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const result = await uploadFileToSupabase(
        file,
        'profile_images',
        'avatars',
        (progress) => {
          console.log(`⏳ [PROFILE-UPLOAD] Progresso: ${progress}%`);
        }
      );

      console.log('✅ [PROFILE-UPLOAD] Upload concluído:', result);
      onChange(result.publicUrl);
      
      toast({
        title: "Foto carregada! ✅",
        description: "Sua foto de perfil foi salva com sucesso.",
      });

    } catch (error: any) {
      console.error('❌ [PROFILE-UPLOAD] Erro no upload:', error);
      
      const errorMessage = error.message?.includes('406') 
        ? 'Problema temporário com o servidor. Tente novamente em alguns momentos.'
        : error.message || 'Erro desconhecido ao fazer upload';
        
      setUploadError(errorMessage);
      
      toast({
        title: "Erro no upload",
        description: "Não foi possível salvar a foto. Você pode tentar novamente ou pular esta etapa.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Limpar o input para permitir re-upload do mesmo arquivo
      event.target.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      <Label className="text-foreground">
        Foto de Perfil (Opcional)
      </Label>
      
      <div className="flex flex-col items-center space-y-4">
        {value ? (
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={value} alt="Foto de perfil" />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
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
          <Avatar className="w-24 h-24 border-2 border-dashed border-border">
            <AvatarFallback className="bg-background text-muted-foreground">
              {isUploading ? (
                <div className="animate-spin">⏳</div>
              ) : (
                <User className="w-8 h-8" />
              )}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Upload Button ou Status */}
        {!value && !isUploading && (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Adicionar Foto
            </Button>
          </div>
        )}

        {/* Estado de carregamento */}
        {isUploading && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            Enviando foto...
          </div>
        )}

        {/* Erro de upload */}
        {uploadError && (
          <div className="text-sm text-destructive flex items-center gap-2 max-w-xs text-center">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        {uploadError 
          ? "Você pode pular esta etapa e adicionar sua foto depois no perfil"
          : "Você pode adicionar ou alterar sua foto depois no perfil"
        }
      </p>
    </div>
  );
};