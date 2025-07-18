
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// FASE 2: Upload OTIMIZADO com retry automático, fallback e logs detalhados
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
  const startTime = Date.now();
  
  try {
    console.log(`📤 [UPLOAD_${requestId}] === INICIANDO UPLOAD OTIMIZADO ===`);
    console.log(`📊 [UPLOAD_${requestId}] Detalhes:`, { 
      fileName: file.name, 
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      bucket: bucketName,
      folder: folderPath,
      timestamp: new Date().toISOString()
    });

    if (onProgressUpdate) onProgressUpdate(5);

    // FASE 2: Normalização avançada de bucket
    const normalizedBucket = bucketName.replace(/[-\s]/g, '_').toLowerCase();
    console.log(`🔧 [UPLOAD_${requestId}] Bucket normalizado:`, { 
      original: bucketName, 
      normalized: normalizedBucket 
    });

    // Validar bucket usando função do banco
    const { data: isValid } = await supabase.rpc('validate_bucket_name', { 
      bucket_name: normalizedBucket 
    });
    
    if (!isValid) {
      throw new Error(`Bucket '${normalizedBucket}' não é permitido ou não existe`);
    }

    if (onProgressUpdate) onProgressUpdate(10);

    // Verificar tamanho do arquivo (10MB limit)
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Limite: ${maxSizeMB}MB`);
    }

    if (onProgressUpdate) onProgressUpdate(15);

    // Verificar timeout de abort signal
    if (abortSignal?.aborted) {
      throw new Error('Upload cancelado pelo usuário');
    }

    // Gerar caminho único e seguro
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 8);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}_${randomSuffix}_${sanitizedFileName}` 
      : `${timestamp}_${randomSuffix}_${sanitizedFileName}`;

    console.log(`📁 [UPLOAD_${requestId}] Caminho gerado:`, filePath);

    if (onProgressUpdate) onProgressUpdate(20);

    // RETRY AUTOMÁTICO com exponential backoff
    let uploadSuccess = false;
    let lastError: any = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries && !uploadSuccess; attempt++) {
      try {
        console.log(`⬆️ [UPLOAD_${requestId}] Tentativa ${attempt}/${maxRetries} - Upload para ${normalizedBucket}...`);
        
        // Timeout personalizado
        const uploadPromise = supabase.storage
          .from(normalizedBucket)
          .upload(filePath, file, {
            upsert: true,
            cacheControl: '3600',
            contentType: file.type || 'application/octet-stream'
          });

        // Aplicar timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout (30s)')), 30000)
        );

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

        if (error) {
          throw error;
        }

        console.log(`✅ [UPLOAD_${requestId}] Upload bem-sucedido (tentativa ${attempt}):`, data);
        uploadSuccess = true;
        
        if (onProgressUpdate) onProgressUpdate(80);

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(normalizedBucket)
          .getPublicUrl(data.path);

        console.log(`🔗 [UPLOAD_${requestId}] URL pública:`, publicUrl);
        if (onProgressUpdate) onProgressUpdate(90);

        // Log de sucesso
        await supabase.rpc('log_upload_activity', {
          p_bucket_name: normalizedBucket,
          p_file_path: data.path,
          p_file_size: file.size,
          p_file_type: file.type,
          p_success: true
        });

        if (onProgressUpdate) onProgressUpdate(100);

        const duration = Date.now() - startTime;
        console.log(`🎉 [UPLOAD_${requestId}] === UPLOAD CONCLUÍDO ===`);
        console.log(`⏱️ [UPLOAD_${requestId}] Duração: ${duration}ms`);

        return {
          path: data.path,
          publicUrl,
          bucket: normalizedBucket,
          fileName: file.name,
          size: file.size
        };

      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ [UPLOAD_${requestId}] Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ [UPLOAD_${requestId}] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Se chegou até aqui, todas as tentativas falharam
    throw lastError || new Error('Todas as tentativas de upload falharam');

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [UPLOAD_${requestId}] === UPLOAD FALHOU === (${duration}ms)`);
    console.error(`❌ [UPLOAD_${requestId}] Erro:`, error.message);
    console.error(`❌ [UPLOAD_${requestId}] Stack:`, error.stack);
    
    // Log de erro
    try {
      await supabase.rpc('log_upload_activity', {
        p_bucket_name: bucketName,
        p_file_path: folderPath || 'unknown',
        p_file_size: file.size,
        p_file_type: file.type,
        p_success: false,
        p_error_message: error.message
      });
    } catch (logError) {
      console.warn('Falha ao registrar log de erro:', logError);
    }
    
    throw new Error(error.message || 'Erro no upload do arquivo');
  }
};
