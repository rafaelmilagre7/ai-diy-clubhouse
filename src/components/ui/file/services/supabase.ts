
import { supabase } from "@/lib/supabase";

// SERVIÇO UNIFICADO DE UPLOAD - Usar uploadFileToStorage como padrão
export const uploadFileToSupabase = async (
  file: File,
  bucketName: string = 'profile_images',
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  // Importar dinamicamente para evitar circular dependency
  const { uploadFileToStorage } = await import('../uploadUtils');
  
  try {
    console.log('🔄 [UNIFIED_UPLOAD] Redirecionando para serviço principal...');
    
    const result = await uploadFileToStorage(
      file,
      bucketName,
      folderPath,
      onProgressUpdate
    );
    
    return {
      publicUrl: result.publicUrl,
      fileName: result.fileName
    };
  } catch (primaryUploadError: any) {
    console.error('❌ [UNIFIED_UPLOAD] Fallback para método legado...');
    
    // FALLBACK: Método original se o principal falhar
    const normalizedBucket = bucketName.replace(/-/g, '_').toLowerCase();
    console.log('🔧 [FALLBACK_UPLOAD] Bucket normalizado:', { original: bucketName, normalized: normalizedBucket });

    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    if (onProgressUpdate) onProgressUpdate(10);

    const { data: uploadResult, error: storageError } = await supabase.storage
      .from(normalizedBucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (storageError) {
      console.error('❌ [FALLBACK_UPLOAD] Erro no upload:', storageError);
      throw new Error(`Falha no upload: ${storageError.message}`);
    }

    console.log('✅ [FALLBACK_UPLOAD] Upload realizado com sucesso:', uploadResult);
    if (onProgressUpdate) onProgressUpdate(80);

    const { data: { publicUrl } } = supabase.storage
      .from(normalizedBucket)
      .getPublicUrl(uploadResult.path);

    console.log('🔗 [FALLBACK_UPLOAD] URL pública gerada:', publicUrl);
    if (onProgressUpdate) onProgressUpdate(100);

    return {
      publicUrl,
      fileName: file.name
    };
  }
};

