/**
 * HOOK UNIFICADO DE UPLOAD
 * 
 * Hook que unifica toda a lógica de upload da plataforma.
 * Mantém compatibilidade com hooks existentes.
 */

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  unifiedUpload, 
  UploadContext, 
  UploadResponse
} from '@/lib/uploads/unified-upload-system';

// =============================================
// INTERFACES
// =============================================

export interface UseSuperFileUploadProps {
  context?: UploadContext;
  customBucket?: string;
  customFolder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  onUploadComplete?: (url: string, fileName: string, fileSize: number) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  autoToast?: boolean;
}

export interface UseSuperFileUploadReturn {
  // Estado
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: {
    url: string;
    name: string;
    size: number;
  } | null;
  
  // Ações
  uploadFile: (file: File) => Promise<void>;
  cancelUpload: () => void;
  clearError: () => void;
  clearUploadedFile: () => void;
  reset: () => void;
  
  // Computed
  hasError: boolean;
  hasUploadedFile: boolean;
  canUpload: boolean;
}

// =============================================
// HOOK PRINCIPAL
// =============================================

export const useSuperFileUpload = ({
  context,
  customBucket,
  customFolder,
  maxSize,
  allowedTypes,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  autoToast = true
}: UseSuperFileUploadProps = {}): UseSuperFileUploadReturn => {
  
  // =============================================
  // ESTADO
  // =============================================
  
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

  // =============================================
  // FUNÇÃO DE UPLOAD
  // =============================================

  const uploadFile = useCallback(async (file: File) => {
    console.log('[SUPER_UPLOAD_HOOK] Iniciando upload:', file.name);
    
    setError(null);
    setIsUploading(true);
    setProgress(0);
    onUploadStart?.();

    try {
      abortControllerRef.current = new AbortController();

      const result = await unifiedUpload(file, {
        context,
        customBucket,
        customFolder,
        maxSize,
        allowedTypes,
        onProgress: (progress) => {
          setProgress(progress);
        },
        abortSignal: abortControllerRef.current.signal
      });

      if (!result.success) {
        throw new Error((result as any).error);
      }

      // Sucesso
      const uploadData = {
        url: result.publicUrl,
        name: result.fileName,
        size: result.fileSize
      };

      setUploadedFile(uploadData);
      onUploadComplete?.(result.publicUrl, result.fileName, result.fileSize);

      if (autoToast) {
        toast({
          title: 'Upload concluído',
          description: `Arquivo "${result.fileName}" enviado com sucesso.`,
        });
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado durante o upload';
      console.error('[SUPER_UPLOAD_HOOK] Erro:', errorMessage);
      
      setError(errorMessage);
      onUploadError?.(errorMessage);

      if (autoToast) {
        toast({
          title: 'Erro no upload',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [
    context, customBucket, customFolder, maxSize, allowedTypes,
    onUploadComplete, onUploadStart, onUploadError, autoToast, toast
  ]);

  // =============================================
  // FUNÇÕES DE CONTROLE
  // =============================================

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      
      if (autoToast) {
        toast({
          title: 'Upload cancelado',
          description: 'O upload foi cancelado pelo usuário.',
        });
      }
    }
  }, [autoToast, toast]);

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

  // =============================================
  // COMPUTED VALUES
  // =============================================

  const hasError = !!error;
  const hasUploadedFile = !!uploadedFile;
  const canUpload = !isUploading;

  // =============================================
  // RETORNO
  // =============================================

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
    hasError,
    hasUploadedFile,
    canUpload,
  };
};

// =============================================
// ALIASES PARA COMPATIBILIDADE
// =============================================

export const useUnifiedFileUpload = useSuperFileUpload;
export default useSuperFileUpload;