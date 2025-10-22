/**
 * WRAPPER DE COMPATIBILIDADE - useFileUpload
 * 
 * Mantém interface antiga mas usa useSuperFileUpload internamente.
 * Criado para garantir compatibilidade sem duplicação de código.
 */

import { useSuperFileUpload } from './useSuperFileUpload';

interface UseFileUploadProps {
  bucketName: string;
  folder?: string;
  onUploadComplete: (url: string, fileName?: string, fileSize?: number) => void;
  maxSize?: number;
}

export const useFileUpload = ({ 
  bucketName, 
  folder = '',
  onUploadComplete, 
  maxSize = 300
}: UseFileUploadProps) => {
  
  const {
    isUploading: uploading,
    uploadedFile,
    error,
    uploadFile: handleFileUpload,
    clearUploadedFile,
    cancelUpload,
  } = useSuperFileUpload({
    customBucket: bucketName,
    customFolder: folder,
    maxSize,
    onUploadComplete: (url, name, size) => {
      onUploadComplete(url, name, size);
    },
    autoToast: true
  });

  return {
    uploading,
    uploadedFileUrl: uploadedFile?.url || null,
    fileName: uploadedFile?.name || null,
    error,
    handleFileUpload,
    setUploadedFileUrl: (url: string | null) => {
      if (!url) clearUploadedFile();
    },
    cancelUpload,
  };
};
