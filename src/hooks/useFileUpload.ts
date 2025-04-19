
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadProps {
  bucketName: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  maxSize?: number;
}

export const useFileUpload = ({ 
  bucketName, 
  onUploadComplete, 
  maxSize = 5 
}: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isUploadingRef = useRef(false);

  const handleFileUpload = async (file: File) => {
    if (isUploadingRef.current) {
      console.log('Upload já em andamento');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`O arquivo excede o tamanho máximo de ${maxSize}MB`);
      toast({
        title: 'Erro no upload',
        description: `O arquivo excede o tamanho máximo de ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    try {
      isUploadingRef.current = true;
      setError(null);
      setUploading(true);
      setFileName(file.name);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Iniciando upload para', { bucketName, filePath });

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      console.log('Upload completo:', data);

      const { data: publicURLData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicURL = publicURLData.publicUrl;
      setUploadedFileUrl(publicURL);
      onUploadComplete(publicURL, file.name, file.size);

      toast({
        title: 'Upload concluído',
        description: 'O arquivo foi enviado com sucesso.',
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      setError(error.message || 'Erro ao fazer upload do arquivo');
      toast({
        title: 'Erro no upload',
        description: error.message || 'Ocorreu um erro ao fazer upload do arquivo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        isUploadingRef.current = false;
      }, 300);
    }
  };

  return {
    uploading,
    uploadedFileUrl,
    fileName,
    error,
    handleFileUpload,
    setUploadedFileUrl,
  };
};
