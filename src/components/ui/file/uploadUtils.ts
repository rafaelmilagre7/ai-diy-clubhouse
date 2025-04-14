
import { supabase } from "@/lib/supabase";

export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    // Criar um nome de arquivo único baseado no timestamp e nome original
    const timestamp = new Date().getTime();
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${file.name}` 
      : `${timestamp}-${file.name}`;

    // Verificar se o bucket existe e criar se necessário
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    // Iniciar o progresso em 10%
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }

    // Upload do arquivo usando o client do Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      throw error;
    }

    // Simular progresso para feedback visual
    if (onProgressUpdate) {
      // Atualizar para 80% após o upload ser concluído
      onProgressUpdate(80);
      
      // Simular o processamento final
      setTimeout(() => {
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
      }, 500);
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};
