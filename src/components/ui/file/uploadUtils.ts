
import { supabase } from "@/lib/supabase";

export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string,
  onProgressUpdate?: (progress: number) => void
) => {
  // Criar um nome de arquivo único baseado no timestamp e nome original
  const timestamp = new Date().getTime();
  const filePath = folderPath 
    ? `${folderPath}/${timestamp}-${file.name}` 
    : `${timestamp}-${file.name}`;

  // Upload do arquivo usando o client do Supabase
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true
    });

  if (error) {
    throw error;
  }

  // Simulate progress updates
  if (onProgressUpdate) {
    const interval = setInterval(() => {
      onProgressUpdate((prev) => Math.min(prev + 10, 100));
    }, 300);
    
    setTimeout(() => {
      clearInterval(interval);
      onProgressUpdate(100);
    }, 3000);
  }

  // Obter URL pública do arquivo
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return {
    publicUrl,
    fileName: file.name
  };
};
