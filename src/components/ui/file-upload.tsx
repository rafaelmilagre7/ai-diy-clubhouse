
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  accept?: string;
  maxSize?: number; // Em MB
  buttonText?: string;
  fieldLabel?: string;
  initialFileUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folder = '', // Definir um valor padrão para folder
  onUploadComplete,
  accept = '*',
  maxSize = 5, // Padrão 5MB
  buttonText = 'Upload do Arquivo',
  fieldLabel = 'Selecione um arquivo',
  initialFileUrl,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validações
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setErrorMessage(`O arquivo é muito grande. O tamanho máximo é ${maxSize}MB.`);
      return;
    }
    
    setErrorMessage(null);
    setIsUploading(true);
    
    try {
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      onUploadComplete(urlData.publicUrl, file.name, file.size);
      
      toast({
        title: 'Upload realizado com sucesso',
        description: 'O arquivo foi enviado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      setErrorMessage(error.message || 'Erro ao fazer upload do arquivo.');
      
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Ocorreu um erro ao enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Limpar o input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <label className="text-sm text-muted-foreground mb-2">
          {fieldLabel}
        </label>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <Button
              type="button"
              variant="outline"
              className={`relative ${isUploading ? 'opacity-70' : ''}`}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {buttonText}
                </>
              )}
            </Button>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          
          {initialFileUrl && (
            <a
              href={initialFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline ml-2"
            >
              Visualizar arquivo atual
            </a>
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};
