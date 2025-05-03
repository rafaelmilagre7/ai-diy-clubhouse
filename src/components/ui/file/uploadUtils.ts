
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Função para upload direto para o Supabase
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  try {
    // Verificar se o bucket existe antes do upload
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não encontrado. Tentando criar...`);
      const result = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600 // 300MB para vídeos, 100MB para outros
      });
      
      if (result.error) {
        console.error("Falha ao criar bucket:", result.error);
        throw new Error(`Não foi possível criar o bucket ${bucketName}: ${result.error.message}`);
      }
    }
    
    // Gerar um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Iniciando upload para bucket "${bucketName}", caminho "${filePath}"`);
    
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      // Tentar definir políticas públicas para o bucket
      try {
        await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
        console.log(`Políticas de acesso público definidas para ${bucketName}, tentando novamente...`);
        
        // Tentar upload novamente após definir políticas
        const retryResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });
          
        if (retryResult.error) {
          throw retryResult.error;
        }
        
        data = retryResult.data;
      } catch (policyError) {
        console.error("Erro ao definir políticas ou fazer upload:", policyError);
        throw error; // Retorna o erro original
      }
    }

    if (onProgressUpdate) {
      onProgressUpdate(90);
    }
    
    // Obter a URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log('URL pública:', urlData.publicUrl);
    
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }
    
    return {
      path: data.path,
      publicUrl: urlData.publicUrl
    };
  } catch (error: any) {
    console.error('Erro no upload:', error);
    throw error;
  }
};
