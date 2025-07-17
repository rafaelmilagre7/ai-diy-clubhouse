
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Função simplificada para upload direto para o Supabase
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  try {
    console.log(`🚀 Iniciando upload: "${file.name}" -> bucket: "${bucketName}", pasta: "${folderPath}"`);
    
    if (onProgressUpdate) onProgressUpdate(5);
    
    // 1. NORMALIZAR NOME DO BUCKET (usar função do banco)
    const { data: normalizedData, error: normalizeError } = await supabase.rpc(
      'normalize_bucket_name', 
      { bucket_name: bucketName }
    );
    
    if (normalizeError) {
      console.error('❌ Erro ao normalizar bucket:', normalizeError);
      throw new Error(`Erro ao normalizar nome do bucket: ${normalizeError.message}`);
    }
    
    const normalizedBucket = normalizedData || bucketName.replace(/-/g, '_').toLowerCase();
    console.log(`📋 Bucket normalizado: "${bucketName}" -> "${normalizedBucket}"`);
    
    if (onProgressUpdate) onProgressUpdate(10);
    
    // 2. GARANTIR QUE O BUCKET EXISTE (usar função do banco)
    console.log(`🔍 Verificando/criando bucket: ${normalizedBucket}`);
    const { data: bucketResult, error: bucketError } = await supabase.rpc(
      'ensure_bucket_exists',
      { p_bucket_name: normalizedBucket }
    );
    
    if (bucketError) {
      console.error('❌ Erro ao verificar bucket:', bucketError);
      throw new Error(`Erro ao verificar bucket: ${bucketError.message}`);
    }
    
    if (!bucketResult?.success) {
      console.error('❌ Falha ao preparar bucket:', bucketResult);
      throw new Error(bucketResult?.message || 'Não foi possível preparar o armazenamento');
    }
    
    console.log(`✅ Bucket pronto: ${bucketResult.bucket_name} (${bucketResult.action})`);
    
    if (onProgressUpdate) onProgressUpdate(20);
    
    // 3. GERAR NOME ÚNICO PARA O ARQUIVO
    const fileExt = file.name.split('.').pop() || '';
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${uuidv4()}_${safeFileName}`;
    const filePath = folderPath ? `${folderPath}/${uniqueFileName}` : uniqueFileName;
    
    console.log(`📁 Caminho do arquivo: ${filePath}`);
    
    if (onProgressUpdate) onProgressUpdate(30);
    
    // 4. FAZER UPLOAD
    console.log('📤 Enviando arquivo...');
    const uploadResult = await supabase.storage
      .from(normalizedBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (uploadResult.error) {
      console.error('❌ Erro no upload:', uploadResult.error);
      throw new Error(`Falha no upload: ${uploadResult.error.message}`);
    }
    
    console.log('✅ Upload concluído:', uploadResult.data.path);
    
    if (onProgressUpdate) onProgressUpdate(80);
    
    // 5. OBTER URL PÚBLICA
    const { data: urlData } = supabase.storage
      .from(normalizedBucket)
      .getPublicUrl(uploadResult.data.path);
    
    if (!urlData?.publicUrl) {
      throw new Error('Não foi possível obter URL pública do arquivo');
    }
    
    console.log('🔗 URL pública:', urlData.publicUrl);
    
    if (onProgressUpdate) onProgressUpdate(100);
    
    return {
      path: uploadResult.data.path,
      publicUrl: urlData.publicUrl,
      bucket: normalizedBucket,
      fileName: file.name,
      size: file.size
    };
    
  } catch (error: any) {
    console.error('💥 Erro completo no upload:', error);
    
    // Mensagens de erro mais claras para os admins
    let userMessage = error.message;
    if (error.message?.includes('Row Level Security')) {
      userMessage = 'Erro de permissão no armazenamento. Contate o suporte técnico.';
    } else if (error.message?.includes('bucket')) {
      userMessage = 'Erro na configuração do armazenamento. Tente novamente em alguns minutos.';
    } else if (error.message?.includes('size') || error.message?.includes('large')) {
      userMessage = 'Arquivo muito grande. Tente um arquivo menor.';
    } else if (error.message?.includes('type') || error.message?.includes('mime')) {
      userMessage = 'Tipo de arquivo não permitido.';
    }
    
    throw new Error(userMessage);
  }
};
