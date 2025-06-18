import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  bucketName: string;
  folderPath?: string;
  onUploadComplete: (url: string, fileName: string, fileSize: number) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  value?: string;
  onRemove?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucketName,
  folderPath = '',
  onUploadComplete,
  acceptedTypes = '*/*',
  maxSizeMB = 100,
  value,
  onRemove
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const uniqueName = `${uuidv4()}.${fileExt}`;
      const filePath = folderPath ? `${folderPath}/${uniqueName}` : uniqueName;

      console.log(`Fazendo upload para: ${bucketName}/${filePath}`);

      // Upload direto para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw new Error(`Falha no upload: ${error.message}`);
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      console.log('Upload concluído:', publicUrl);

      setFileName(file.name);
      onUploadComplete(publicUrl, file.name, file.size);
      toast.success('Arquivo enviado com sucesso!');

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    if (onRemove) onRemove();
  };

  // Se já tem um arquivo carregado
  if (value || fileName) {
    const displayName = fileName || value?.split('/').pop() || 'Arquivo';
    
    return (
      <div className="flex items-center p-4 space-x-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <File className="h-10 w-10 flex-shrink-0 text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate dark:text-white">
            {displayName}
          </p>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            Arquivo carregado com sucesso
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemoveFile}
          disabled={uploading}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <label
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
          "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
          "border-gray-300 dark:border-gray-600",
          uploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 mb-3 text-gray-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fazendo upload...
              </p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-3 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tamanho máximo: {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
        <Input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          accept={acceptedTypes}
        />
      </label>
    </div>
  );
};
