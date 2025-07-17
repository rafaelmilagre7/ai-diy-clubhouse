
import { supabase } from "@/lib/supabase";

export const uploadFileToSupabase = async (
  file: File,
  bucketName: string = 'profile_images',
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    console.log('📤 [PROFILE_UPLOAD] Iniciando upload de perfil:', { fileName: file.name, bucketName, folderPath });
    
    // Normalizar bucket name (remover hífens)
    const normalizedBucket = bucketName.replace(/-/g, '_').toLowerCase();
    console.log('🔧 [PROFILE_UPLOAD] Bucket normalizado:', { original: bucketName, normalized: normalizedBucket });

    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    if (onProgressUpdate) onProgressUpdate(10);

    // Upload direto usando bucket normalizado
    const { data, error } = await supabase.storage
      .from(normalizedBucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (error) {
      console.error('❌ [PROFILE_UPLOAD] Erro no upload:', error);
      throw new Error(`Falha no upload: ${error.message}`);
    }

    console.log('✅ [PROFILE_UPLOAD] Upload realizado com sucesso:', data);
    if (onProgressUpdate) onProgressUpdate(80);

    const { data: { publicUrl } } = supabase.storage
      .from(normalizedBucket)
      .getPublicUrl(data.path);

    console.log('🔗 [PROFILE_UPLOAD] URL pública gerada:', publicUrl);
    if (onProgressUpdate) onProgressUpdate(100);

    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error: any) {
    console.error('❌ [PROFILE_UPLOAD] Erro completo:', error);
    throw new Error(error.message || 'Erro no upload da imagem de perfil');
  }
};

