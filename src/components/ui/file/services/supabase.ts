
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

export const uploadFileToSupabase = async (
  file: File,
  bucketName: string,
  folderPath: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    logger.info('Iniciando upload seguro de arquivo', {
      fileName: sanitizedFileName,
      bucketName,
      folderPath
    });

    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      logger.info(`Criando bucket ${bucketName}...`);
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    if (onProgressUpdate) onProgressUpdate(10);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      logger.error('Erro no upload de arquivo:', error);
      throw error;
    }

    if (onProgressUpdate) onProgressUpdate(80);

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (onProgressUpdate) onProgressUpdate(100);

    logger.info('Upload de arquivo concluído com sucesso', {
      filePath: data.path,
      publicUrl: publicUrl.substring(0, 50) + '...' // Log seguro da URL
    });

    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error) {
    logger.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};
