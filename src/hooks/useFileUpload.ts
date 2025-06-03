
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { compressImage, isValidImageFile, formatFileSize } from '@/utils/imageCompression';

interface UseFileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  maxSize?: number;
  autoCompress?: boolean; // Nova opção para compressão automática
}

export const useFileUpload = ({ 
  bucketName, 
  folder = '',
  onUploadComplete, 
  maxSize = 300, // 300MB por padrão
  autoCompress = true // Compressão ativada por padrão
}: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<string | null>(null);
  const { toast } = useToast();
  const isUploadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      toast({
        title: 'Upload cancelado',
        description: 'O upload do arquivo foi cancelado.',
      });
    }
  };

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
      abortControllerRef.current = new AbortController();
      isUploadingRef.current = true;
      setError(null);
      setUploading(true);
      setFileName(file.name);

      let processedFile = file;
      
      // Aplicar compressão automática se habilitada e for imagem
      if (autoCompress && isValidImageFile(file)) {
        setCompressionProgress('Comprimindo imagem...');
        
        try {
          const originalSize = formatFileSize(file.size);
          processedFile = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            maxSizeKB: 500
          });
          const compressedSize = formatFileSize(processedFile.size);
          
          console.log(`Compressão concluída: ${originalSize} → ${compressedSize}`);
          setCompressionProgress(null);
          
          toast({
            title: 'Imagem otimizada',
            description: `Tamanho reduzido de ${originalSize} para ${compressedSize}`,
          });
        } catch (compressionError) {
          console.warn('Falha na compressão, usando arquivo original:', compressionError);
          setCompressionProgress(null);
          // Continuar com arquivo original se compressão falhar
        }
      }

      // Gerar nome único para o arquivo
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      
      console.log('Iniciando upload para:', bucketName, filePath);

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: true,
          duplex: "half",
        });

      if (error) {
        console.error('Erro no upload para o Supabase:', error);
        throw error;
      }
      
      console.log('Upload realizado com sucesso:', data);

      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('URL pública obtida:', urlData.publicUrl);
      
      const publicUrl = urlData.publicUrl;
      setUploadedFileUrl(publicUrl);
      onUploadComplete(publicUrl, processedFile.name, processedFile.size);

      toast({
        title: 'Upload concluído',
        description: 'O arquivo foi enviado com sucesso.',
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      
      const errorMessage = error.message || 'Erro ao fazer upload do arquivo';
      let displayMessage = errorMessage;
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        displayMessage = 'Tempo limite excedido ou problema de conexão. Tente novamente com um arquivo menor ou verifique sua conexão.';
      } else if (errorMessage.includes('size')) {
        displayMessage = `O arquivo excede o tamanho máximo de ${maxSize}MB.`;
      }
      
      setError(displayMessage);
      toast({
        title: 'Erro no upload',
        description: displayMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setCompressionProgress(null);
      abortControllerRef.current = null;
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
    compressionProgress,
    handleFileUpload,
    setUploadedFileUrl,
    cancelUpload,
  };
};
