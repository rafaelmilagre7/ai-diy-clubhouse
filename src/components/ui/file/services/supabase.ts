
import { supabase } from "@/lib/supabase";

export const uploadFileToSupabase = async (
  file: File,
  bucketName: string = 'profile_images',
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    console.log('📤 [UPLOAD] Iniciando upload:', { fileName: file.name, bucketName, folderPath });
    
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    // 🎯 CORREÇÃO: Usar apenas buckets com underscores (sem hífen)
    const safeBucketName = bucketName.replace(/-/g, '_');
    console.log('🔧 [UPLOAD] Bucket normalizado:', { original: bucketName, safe: safeBucketName });

    if (onProgressUpdate) onProgressUpdate(10);

    // 🎯 CORREÇÃO: Upload direto sem verificar/criar bucket (já existe)
    const { data, error } = await supabase.storage
      .from(safeBucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ [UPLOAD] Erro no upload:', error);
      throw error;
    }

    console.log('✅ [UPLOAD] Upload realizado com sucesso:', data);
    if (onProgressUpdate) onProgressUpdate(80);

    const { data: { publicUrl } } = supabase.storage
      .from(safeBucketName)
      .getPublicUrl(data.path);

    console.log('🔗 [UPLOAD] URL pública gerada:', publicUrl);
    if (onProgressUpdate) onProgressUpdate(100);

    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error) {
    console.error('❌ [UPLOAD] Erro completo:', error);
    throw error;
  }
};

