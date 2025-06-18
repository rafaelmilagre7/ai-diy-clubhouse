import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

// Função para verificar se um bucket existe e criá-lo se necessário
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Verificando bucket: ${bucketName}`);
    
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erro ao listar buckets:', error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não existe, tentando criar...`);
      
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 104857600 // 100MB
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        
        // Tentar via RPC como fallback
        try {
          const { error: rpcError } = await supabase.rpc('create_storage_public_policy', {
            bucket_name: bucketName
          });
          
          if (rpcError) {
            console.error(`Erro ao criar bucket via RPC: ${rpcError.message}`);
            return false;
          }
          
          console.log(`Bucket ${bucketName} criado via RPC com sucesso`);
          return true;
        } catch (rpcError) {
          console.error(`Falha na criação via RPC:`, rpcError);
          return false;
        }
      }
      
      console.log(`Bucket ${bucketName} criado com sucesso`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error);
    return false;
  }
};

// Função de upload com fallback melhorado
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgress?: (progress: number) => void,
  fallbackBucket?: string
): Promise<{ publicUrl: string; path: string; error: null } | { error: Error }> => {
  try {
    if (onProgress) onProgress(5);
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Iniciando upload: ${file.name} -> ${bucketName}/${filePath}`);
    
    if (onProgress) onProgress(25);
    
    // Verificar se o bucket principal existe
    const bucketReady = await ensureBucketExists(bucketName);
    if (!bucketReady && fallbackBucket) {
      console.log(`Bucket principal ${bucketName} não disponível, usando fallback ${fallbackBucket}`);
      bucketName = fallbackBucket;
      await ensureBucketExists(bucketName);
    }
    
    if (onProgress) onProgress(40);
    
    // Tentar upload no bucket principal
    let uploadResult = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
    
    // Se falhar e tiver fallback, tentar no fallback
    if (uploadResult.error && fallbackBucket && bucketName !== fallbackBucket) {
      console.log(`Upload falhou no bucket ${bucketName}, tentando fallback ${fallbackBucket}`);
      
      await ensureBucketExists(fallbackBucket);
      
      uploadResult = await supabase.storage
        .from(fallbackBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      // Atualizar bucketName para o fallback se deu certo
      if (!uploadResult.error) {
        bucketName = fallbackBucket;
        console.log(`Upload bem-sucedido no bucket fallback ${fallbackBucket}`);
      }
    }
    
    if (uploadResult.error) {
      console.error(`Falha final no upload:`, uploadResult.error);
      throw new Error(`Falha no upload: ${uploadResult.error.message}`);
    }
    
    if (onProgress) onProgress(80);
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadResult.data.path);
    
    if (!urlData.publicUrl) {
      throw new Error('Falha ao obter URL pública');
    }
    
    console.log(`Upload concluído com sucesso: ${urlData.publicUrl}`);
    
    if (onProgress) onProgress(100);
    
    return {
      publicUrl: urlData.publicUrl,
      path: uploadResult.data.path,
      error: null
    };
    
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return { 
      error: error instanceof Error ? error : new Error(error.message || 'Erro desconhecido') 
    };
  }
};

// Configurar buckets de armazenamento
export const setupLearningStorageBuckets = async (): Promise<{ success: boolean; error?: string }> => {
  const buckets = [
    'learning_materials',
    'course_images', 
    'learning_videos',
    'solution_files',
    'lesson_images',
    'event_images',
    'general_storage'
  ];
  
  try {
    console.log('Configurando buckets de armazenamento...');
    
    let successCount = 0;
    const errors: string[] = [];
    
    for (const bucket of buckets) {
      try {
        const success = await ensureBucketExists(bucket);
        if (success) {
          successCount++;
          console.log(`✓ Bucket ${bucket} configurado`);
        } else {
          errors.push(`Falha ao configurar bucket ${bucket}`);
          console.error(`✗ Falha ao configurar bucket ${bucket}`);
        }
      } catch (error: any) {
        const errorMsg = `Erro ao configurar bucket ${bucket}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }
    
    if (successCount === 0) {
      return { 
        success: false, 
        error: `Nenhum bucket pôde ser configurado. Erros: ${errors.join(', ')}` 
      };
    }
    
    if (errors.length > 0) {
      return { 
        success: true, 
        error: `${successCount}/${buckets.length} buckets configurados. Problemas: ${errors.join(', ')}` 
      };
    }
    
    console.log(`✓ Todos os ${successCount} buckets configurados com sucesso`);
    return { success: true };
    
  } catch (error: any) {
    console.error('Erro geral na configuração de buckets:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao configurar buckets' 
    };
  }
};

// Função para extrair ID de vídeo do YouTube
export const getYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Função para obter thumbnail do YouTube
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Função para formatar duração de vídeo
export const formatVideoDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Função para extrair informações de vídeo Panda
export const extractPandaVideoInfo = (embedCode: string) => {
  try {
    // Extrair src do iframe
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
    if (!srcMatch) {
      return { videoId: null, url: null, thumbnailUrl: null };
    }
    
    const url = srcMatch[1];
    
    // Extrair ID do vídeo da URL do Panda Video
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    // Gerar URL de thumbnail (se o Panda Video suportar)
    const thumbnailUrl = videoId ? `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/thumbnail/${videoId}.jpg` : null;
    
    return {
      videoId,
      url,
      thumbnailUrl
    };
  } catch (error) {
    console.error('Erro ao extrair informações do vídeo Panda:', error);
    return { videoId: null, url: null, thumbnailUrl: null };
  }
};
