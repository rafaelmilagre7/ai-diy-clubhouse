
// DEPRECATED: Use UnifiedFileUpload component and uploadFileUnified function instead
// This file is kept for backward compatibility only

import { uploadFileUnified } from "@/lib/supabase/storage-unified";

export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  console.warn('uploadFileToStorage is deprecated. Use uploadFileUnified instead.');
  
  try {
    const result = await uploadFileUnified(
      file, 
      bucketName, 
      folderPath, 
      onProgressUpdate
    );
    
    return {
      path: result.path,
      publicUrl: result.publicUrl,
      bucket: bucketName,
      fileName: file.name,
      size: file.size
    };
  } catch (error: any) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw new Error(`Erro no upload: ${error.message || "Erro desconhecido durante o upload"}`);
  }
};
