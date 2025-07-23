
/**
 * HOOK UNIFICADO DE UPLOAD - VERSÃO OTIMIZADA
 * 
 * Hook mantido para compatibilidade total.
 * Agora usa o sistema unificado internamente.
 * 
 * ⚠️ PARA NOVOS PROJETOS: Use useSuperFileUpload
 */

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  legacyUpload, 
  mapLegacyBucketToContext,
  UPLOAD_CONTEXTS 
} from '@/lib/uploads/unified-upload-system';

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
    console.log(`[UNIFIED_UPLOAD] Upload via hook unificado para bucket: ${bucketName}`);
    
    setError(null);
    setIsUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      abortControllerRef.current = new AbortController();

      const result = await legacyUpload(
        file,
        bucketName,
        folder,
        (progress) => {
          console.log(`[UNIFIED_UPLOAD] Progresso: ${progress}%`);
          setProgress(progress);
        }
      );

      if (!result.success) {
        throw new Error((result as any).error);
      }

      const uploadedFileData = {
        url: result.publicUrl,
        name: result.fileName,
        size: result.fileSize,
      };

      console.log(`[UNIFIED_UPLOAD] Upload concluído: ${result.publicUrl}`);
      setUploadedFile(uploadedFileData);
      onUploadComplete?.(result.publicUrl, result.fileName, result.fileSize);

      toast({
        title: 'Upload concluído',
        description: `Arquivo "${result.fileName}" enviado com sucesso.`,
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
