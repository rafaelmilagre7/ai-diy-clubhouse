import { supabase } from "./client";

/**
 * Verifica se um bucket existe e cria se não existir
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Erro ao listar buckets:", error);
      return false;
    }
    
    // Se o bucket já existe, retorna true
    if (buckets?.some(b => b.name === bucketName)) {
      return true;
    }
    
    // Se não existe, tenta criar
    console.log(`Criando bucket ${bucketName}`);
    const { data, error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: 104857600, // 100MB
      }
    );
    
    if (createError) {
      console.error(`Erro ao criar bucket ${bucketName}:`, createError);
      return false;
    }
    
    // Criar políticas de acesso público para o bucket
    try {
      await createStoragePublicPolicy(bucketName);
    } catch (policyError) {
      console.error(`Erro ao definir políticas para ${bucketName}:`, policyError);
      // Não falha o processo se não conseguir definir políticas
    }
    
    return true;
  } catch (e) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, e);
    return false;
  }
};

/**
 * Cria política de acesso público para um bucket
 */
export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error(`Erro ao criar política pública para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Faz upload de arquivo com fallback para outros buckets caso o principal falhe
 */
export const uploadFileWithFallback = async (
  file: File,
  primaryBucketName: string,
  folderPath: string = "",
  onProgressUpdate?: (progress: number) => void,
  fallbackBucketName: string = "learning_materials"
) => {
  // Lista de buckets para tentar em ordem de preferência
  const bucketsToTry = [primaryBucketName, fallbackBucketName, "solution_files"];
  
  // Gerar um nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
  const actualFolderPath = folderPath ? `${folderPath}` : "";
  
  let lastError = null;
  
  // Tentar cada bucket na sequência
  for (const currentBucket of bucketsToTry) {
    try {
      console.log(`Tentando upload para bucket: ${currentBucket}`);
      
      if (onProgressUpdate) onProgressUpdate(10);
      
      // Verificar/criar bucket se necessário
      await ensureBucketExists(currentBucket);
      
      if (onProgressUpdate) onProgressUpdate(30);
      
      // Definir o caminho do arquivo
      const filePath = actualFolderPath ? `${actualFolderPath}/${uniqueFileName}` : uniqueFileName;
      
      // Fazer upload
      const { data, error } = await supabase.storage
        .from(currentBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
        
      if (error) {
        lastError = error;
        console.error(`Erro no upload para ${currentBucket}:`, error);
        
        // Se o erro for relacionado a política RLS, tentar criar políticas
        if (error.message.includes('security') || error.message.includes('policy')) {
          try {
            console.log("Tentando configurar políticas de acesso para:", currentBucket);
            await supabase.rpc('create_storage_public_policy', {
              bucket_name: currentBucket
            });
            
            // Tentar novamente após configurar políticas
            const retryResult = await supabase.storage
              .from(currentBucket)
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
              });
              
            if (!retryResult.error) {
              // Se o segundo upload funcionar, continuar com o fluxo normal
              if (onProgressUpdate) onProgressUpdate(70);
              
              const { data: urlData } = supabase.storage
                .from(currentBucket)
                .getPublicUrl(filePath);
              
              if (onProgressUpdate) onProgressUpdate(100);
              
              return {
                success: true,
                bucket: currentBucket,
                path: filePath,
                publicUrl: urlData.publicUrl
              };
            }
          } catch (policyError) {
            console.error(`Erro ao configurar políticas para ${currentBucket}:`, policyError);
          }
        }
        
        continue; // Tentar o próximo bucket
      }
      
      if (onProgressUpdate) onProgressUpdate(70);
      
      // Obter a URL pública
      const { data: urlData } = supabase.storage
        .from(currentBucket)
        .getPublicUrl(filePath);
      
      if (!urlData?.publicUrl) {
        console.error(`URL pública não disponível para ${currentBucket}`);
        continue;
      }
      
      if (onProgressUpdate) onProgressUpdate(100);
      
      // Retornar resultado de sucesso
      return {
        success: true,
        bucket: currentBucket,
        path: filePath,
        publicUrl: urlData.publicUrl
      };
    } catch (err) {
      lastError = err;
      console.error(`Erro ao usar bucket ${currentBucket}:`, err);
    }
  }
  
  // Se chegou aqui, todos os buckets falharam
  throw lastError || new Error("Falha ao fazer upload do arquivo em todos os buckets disponíveis");
};

// Funções para extrair informações de vídeos do YouTube
export const getYoutubeVideoId = (url: string): string | null => {
  // Extrair ID de vários formatos de URL do YouTube
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11)
    ? match[2]
    : null;
};

export const getYoutubeThumbnailUrl = (videoId: string): string => {
  // Obtém miniatura de alta qualidade para o vídeo
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export const formatVideoDuration = (seconds: number): string => {
  if (!seconds) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let result = '';
  
  if (hrs > 0) {
    result += `${hrs.toString().padStart(2, '0')}:`;
  }
  
  result += `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  return result;
};

// Função para configurar buckets para o módulo de aprendizagem
export const setupLearningStorageBuckets = async () => {
  const requiredBuckets = ['learning_materials', 'solution_files', 'course_images', 'learning_videos'];
  let allSuccessful = true;
  let errorMessages = [];
  
  for (const bucket of requiredBuckets) {
    try {
      const success = await ensureBucketExists(bucket);
      if (!success) {
        allSuccessful = false;
        errorMessages.push(`Falha ao configurar bucket ${bucket}`);
      }
    } catch (error) {
      console.error(`Erro ao configurar bucket ${bucket}:`, error);
      allSuccessful = false;
      errorMessages.push(`Erro ao configurar bucket ${bucket}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return {
    success: allSuccessful,
    message: allSuccessful ? 'Todos os buckets configurados com sucesso' : 
      `Alguns buckets não puderam ser configurados: ${errorMessages.join(', ')}`
  };
};

// Função para extrair o ID do vídeo do Panda Video de uma URL
export const getPandaVideoId = (url: string): string | null => {
  try {
    // Formato comum do player do Panda Video
    if (url.includes('pandavideo.com.br/embed')) {
      // Formato: https://player-vz-XXXXX.tv.pandavideo.com.br/embed/?v=VIDEO_ID
      const match = url.match(/[?&]v=([^&]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Formato comum do iframe do Panda Video (id="panda-VIDEO_ID")
    const iframeMatch = url.match(/id="panda-(.*?)"/i);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    
    // Formato alternativo
    if (url.includes('/embed/?') && url.includes('pandavideo')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair ID do vídeo Panda:', error);
    return null;
  }
};

// Função para obter a URL da thumbnail do Panda Video
export const getPandaThumbnailUrl = (videoId: string): string => {
  return `https://thumbnails-vz-d6ebf577-797.tv.pandavideo.com.br/thumbnails/${videoId}/default.jpg`;
};

// Função para extrair informações do iframe do Panda Video
export const extractPandaVideoInfo = (iframeCode: string): {
  videoId: string;
  url: string;
  thumbnailUrl: string;
} | null => {
  try {
    // Extrair o ID do vídeo
    const idMatch = iframeCode.match(/id="panda-(.*?)"/i);
    const srcMatch = iframeCode.match(/src="(.*?)"/i);
    
    if (!idMatch || idMatch.length < 2 || !srcMatch || srcMatch.length < 2) {
      return null;
    }
    
    const videoId = idMatch[1];
    const embedUrl = srcMatch[1];
    
    // Construir URL da thumbnail com base no ID
    const thumbnailUrl = getPandaThumbnailUrl(videoId);
    
    return {
      videoId,
      url: embedUrl,
      thumbnailUrl
    };
  } catch (error) {
    console.error("Erro ao extrair informações do iframe:", error);
    return null;
  }
};
