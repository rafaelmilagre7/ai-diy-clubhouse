
import { uploadImageToImgBB } from './services/imgbb';
import { uploadFileToSupabase } from './services/supabase';
import { isImageFile } from './utils/fileTypes';

export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    if (isImageFile(file)) {
      const apiKey = "04b796a219698057ded57d20ec1705cf";
      return await uploadImageToImgBB(file, apiKey, onProgressUpdate);
    }

    return await uploadFileToSupabase(file, bucketName, folderPath, onProgressUpdate);
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};

// Re-export para manter compatibilidade com código existente
export { uploadImageToImgBB } from './services/imgbb';
export { uploadFileToSupabase } from './services/supabase';
export * from './utils/fileTypes';
