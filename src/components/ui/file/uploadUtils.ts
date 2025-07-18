
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// FASE 2: Upload direto para o Supabase Storage com buckets padronizados e logs detalhados
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath?: string,
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
): Promise<{
  path: string;
  publicUrl: string;
  bucket: string;
  fileName: string;
  size: number;
}> => {
  const requestId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`📤 [STORAGE_UPLOAD_${requestId}] Iniciando upload:`, { 
      fileName: file.name, 
      size: file.size,
      type: file.type,
      bucket: bucketName,
      folder: folderPath 
    });

    if (onProgressUpdate) onProgressUpdate(5);

    // FASE 2: Usar bucket padronizado
    const normalizedBucket = bucketName.replace(/[-\s]/g, '_').toLowerCase();
    console.log(`🔧 [STORAGE_UPLOAD_${requestId}] Bucket normalizado:`, { original: bucketName, normalized: normalizedBucket });

    // Lista de buckets permitidos
    const allowedBuckets = ['profile_images', 'solution_files', 'learning_materials', 'learning_videos', 'learning_covers', 'tool_logos'];
    if (!allowedBuckets.includes(normalizedBucket)) {
      throw new Error(`Bucket '${normalizedBucket}' não é permitido. Buckets permitidos: ${allowedBuckets.join(', ')}`);
    }

    if (onProgressUpdate) onProgressUpdate(10);

    // Verificar se bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error(`❌ [STORAGE_UPLOAD_${requestId}] Erro ao listar buckets:`, bucketsError);
      throw new Error(`Erro ao verificar buckets: ${bucketsError.message}`);
    }

    const bucketExists = buckets?.some(bucket => bucket.id === normalizedBucket);
    if (!bucketExists) {
      console.error(`❌ [STORAGE_UPLOAD_${requestId}] Bucket não existe:`, normalizedBucket);
      console.log(`📋 [STORAGE_UPLOAD_${requestId}] Buckets disponíveis:`, buckets?.map(b => b.id));
      throw new Error(`Bucket '${normalizedBucket}' não existe. Contate o administrador.`);
    }

    if (onProgressUpdate) onProgressUpdate(20);

    // Gerar nome único para o arquivo
    const timestamp = new Date().getTime();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${sanitizedFileName}` 
      : `${timestamp}-${sanitizedFileName}`;

    console.log(`📁 [STORAGE_UPLOAD_${requestId}] Caminho do arquivo:`, filePath);

    if (onProgressUpdate) onProgressUpdate(30);

    // Upload do arquivo
    console.log(`⬆️ [STORAGE_UPLOAD_${requestId}] Iniciando upload para bucket ${normalizedBucket}...`);
    const { data, error } = await supabase.storage
      .from(normalizedBucket)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (error) {
      console.error(`❌ [STORAGE_UPLOAD_${requestId}] Erro no upload:`, error);
      console.error(`❌ [STORAGE_UPLOAD_${requestId}] Detalhes:`, JSON.stringify(error, null, 2));
      throw new Error(`Falha no upload: ${error.message}`);
    }

    console.log(`✅ [STORAGE_UPLOAD_${requestId}] Upload realizado com sucesso:`, data);
    if (onProgressUpdate) onProgressUpdate(80);

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(normalizedBucket)
      .getPublicUrl(data.path);

    console.log(`🔗 [STORAGE_UPLOAD_${requestId}] URL pública gerada:`, publicUrl);
    if (onProgressUpdate) onProgressUpdate(100);

    console.log(`🎉 [STORAGE_UPLOAD_${requestId}] Upload concluído com sucesso!`);

    return {
      path: data.path,
      publicUrl,
      bucket: normalizedBucket,
      fileName: file.name,
      size: file.size
    };

  } catch (error: any) {
    console.error(`❌ [STORAGE_UPLOAD_${requestId}] Erro completo:`, error);
    console.error(`❌ [STORAGE_UPLOAD_${requestId}] Stack trace:`, error.stack);
    throw new Error(error.message || 'Erro no upload do arquivo');
  }
};
