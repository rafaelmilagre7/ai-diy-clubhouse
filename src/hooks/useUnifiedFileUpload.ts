
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFileUnified, validateFileForBucket } from '@/lib/supabase/storage-unified';

interface UseUnifiedFileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete?: (url: string, fileName: string, fileSize: number) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
}

export const useUnifiedFileUpload = ({
  bucketName,
  folder,
  onUploadComplete,
  onUploadStart,
  onUploadError,
}: UseUnifiedFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    console.log(`[UNIFIED_UPLOAD] Iniciando upload para bucket: ${bucketName}`);
    
    // Validação inicial
    const validation = validateFileForBucket(file, bucketName);
    if (!validation.valid) {
      const errorMsg = validation.error || 'Arquivo inválido';
      console.error(`[UNIFIED_UPLOAD] Validação falhou: ${errorMsg}`);
      setError(errorMsg);
      onUploadError?.(errorMsg);
      toast({
        title: 'Erro na validação',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      abortControllerRef.current = new AbortController();

      const result = await uploadFileUnified(
        file,
        bucketName,
        folder,
        (progress) => {
          console.log(`[UNIFIED_UPLOAD] Progresso: ${progress}%`);
          setProgress(progress);
        }
      );

      const uploadedFileData = {
        url: result.publicUrl,
        name: file.name,
        size: file.size,
      };

      console.log(`[UNIFIED_UPLOAD] Upload concluído: ${result.publicUrl}`);
      setUploadedFile(uploadedFileData);
      onUploadComplete?.(result.publicUrl, file.name, file.size);

      toast({
        title: 'Upload concluído',
        description: `Arquivo "${file.name}" enviado com sucesso.`,
      });

    } catch (error: any) {
      const errorMsg = error.message || 'Erro ao fazer upload';
      console.error(`[UNIFIED_UPLOAD] Erro: ${errorMsg}`, error);
      setError(errorMsg);
      onUploadError?.(errorMsg);

      toast({
        title: 'Erro no upload',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [bucketName, folder, onUploadComplete, onUploadStart, onUploadError, toast]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      
      toast({
        title: 'Upload cancelado',
        description: 'O upload foi cancelado pelo usuário.',
      });
    }
  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearUploadedFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setUploadedFile(null);
    setProgress(0);
    if (isUploading) {
      cancelUpload();
    }
  }, [isUploading, cancelUpload]);

  return {
    // Estado
    isUploading,
    progress,
    error,
    uploadedFile,
    
    // Ações
    uploadFile,
    cancelUpload,
    clearError,
    clearUploadedFile,
    reset,
    
    // Computed
    hasError: !!error,
    hasUploadedFile: !!uploadedFile,
    canUpload: !isUploading,
  };
};
