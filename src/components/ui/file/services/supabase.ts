
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

    // Verificar se bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    let bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Se bucket não existe, tentar usar fallback ou criar
    if (!bucketExists) {
      console.warn(`[SUPABASE_SERVICE] Bucket ${bucketName} não existe`);
      
      // Se não é um bucket padrão, usar fallback
      if (!Object.values(STORAGE_BUCKETS).includes(bucketName)) {
        console.log(`[SUPABASE_SERVICE] Usando bucket fallback`);
        bucketName = STORAGE_BUCKETS.FALLBACK;
        bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      }
      
      // Se ainda não existe, tentar criar
      if (!bucketExists) {
        console.log(`[SUPABASE_SERVICE] Criando bucket: ${bucketName}`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024 // 50MB default
        });
        
        if (createError) {
          console.error(`[SUPABASE_SERVICE] Erro ao criar bucket:`, createError);
          throw new Error(`Erro ao criar bucket: ${createError.message}`);
        }
      }
    }

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
