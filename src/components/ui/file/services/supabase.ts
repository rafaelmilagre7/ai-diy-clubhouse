
import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

export const uploadFileToSupabase = async (
  file: File,
  bucketName: string,
  folderPath?: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    console.log(`[SUPABASE_SERVICE] Iniciando upload para bucket: ${bucketName}`);
    
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    // Evitar operações administrativas de buckets no client (list/create)
    // Tentamos upload direto; em caso de erro por bucket inexistente, usamos fallback

    if (onProgressUpdate) onProgressUpdate(10);

    console.log(`[SUPABASE_SERVICE] Fazendo upload do arquivo: ${filePath}`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`[SUPABASE_SERVICE] Erro no upload:`, error);
      throw error;
    }

    if (onProgressUpdate) onProgressUpdate(80);

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (onProgressUpdate) onProgressUpdate(100);

    console.log(`[SUPABASE_SERVICE] Upload concluído: ${publicUrl}`);
    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error) {
    console.error("[SUPABASE_SERVICE] Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};
