import { supabase } from "./client";

/**
 * Verifica se um bucket existe e cria se não existir
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Verificando se o bucket ${bucketName} existe...`);
    
    // Verificar se o bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Erro ao listar buckets:", error);
      return false;
    }
    
    // Se o bucket já existe, retorna true
    if (buckets?.some(b => b.name === bucketName)) {
      console.log(`Bucket ${bucketName} já existe.`);
      return true;
    }
    
    // Se não existe, tenta criar
    console.log(`Criando bucket ${bucketName}`);
    const { data, error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600, // 300MB para vídeos, 100MB para outros
      }
    );
    
    if (createError) {
      console.error(`Erro ao criar bucket ${bucketName}:`, createError);
      
      // Se falhou por permissão ou RLS, tentar via RPC
      if (createError.message.includes('permission') || createError.message.includes('policy')) {
        try {
          console.log(`Tentando criar bucket ${bucketName} via RPC...`);
          const { success, error: rpcError } = await createStoragePublicPolicy(bucketName);
          
          if (rpcError) {
            console.error(`Erro ao criar bucket ${bucketName} via RPC:`, rpcError);
            return false;
          }
          
          return success;
        } catch (rpcException) {
          console.error(`Exceção ao criar bucket ${bucketName} via RPC:`, rpcException);
          return false;
        }
      }
      
      return false;
    }
    
    // Criar políticas de acesso público para o bucket
    try {
      console.log(`Configurando políticas para ${bucketName}...`);
      await createStoragePublicPolicy(bucketName);
      console.log(`Políticas configuradas para ${bucketName}`);
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
 * Esta função será mantida aqui para compatibilidade com código existente
 * mas internamente chamará a versão em rpc.ts
 */
export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    // Importação interna para evitar o conflito circular
    const { createStoragePublicPolicy: rpcCreatePolicy } = await import("./rpc");
    return await rpcCreatePolicy(bucketName);
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
  const requiredBuckets = ['learning_materials', 'course_images', 'learning_videos', 'solution_files'];
  
  try {
    console.log("Configurando buckets de aprendizagem via RPC...");
    
    // Tentar usar a função RPC dedicada primeiro (mais confiável)
    try {
      const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
      if (!error) {
        console.log("Configuração de buckets via RPC bem-sucedida:", data);
        return data || { 
          success: true, 
          message: 'Buckets configurados com sucesso via RPC'
        };
      } else {
        console.error("Erro na RPC setup_learning_storage_buckets:", error);
        // Continuar com o método tradicional como fallback
      }
    } catch (rpcError) {
      console.error("Exceção na RPC setup_learning_storage_buckets:", rpcError);
      // Continuar com o método tradicional como fallback
    }
    
    console.log("Usando método tradicional para configurar buckets...");
    let allSuccessful = true;
    let errorMessages: string[] = [];
    let successMessages: string[] = [];
    
    for (const bucket of requiredBuckets) {
      try {
        console.log(`Configurando bucket ${bucket}...`);
        const success = await ensureBucketExists(bucket);
        
        if (success) {
          successMessages.push(`Bucket ${bucket} configurado com sucesso`);
          console.log(`✓ Bucket ${bucket} configurado com sucesso`);
        } else {
          allSuccessful = false;
          errorMessages.push(`Falha ao configurar bucket ${bucket}`);
          console.error(`✗ Falha ao configurar bucket ${bucket}`);
        }
      } catch (error) {
        console.error(`✗ Erro ao configurar bucket ${bucket}:`, error);
        allSuccessful = false;
        errorMessages.push(`Erro ao configurar bucket ${bucket}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return {
      success: allSuccessful,
      message: allSuccessful ? 
        'Todos os buckets configurados com sucesso' : 
        `Alguns buckets não puderam ser configurados: ${errorMessages.join(', ')}`,
      details: {
        success: successMessages,
        errors: errorMessages
      }
    };
  } catch (error) {
    console.error("Erro ao configurar buckets:", error);
    return {
      success: false,
      message: `Erro ao configurar buckets: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Extrai informações de um vídeo do Panda a partir do código de incorporação
 * @param embedCode Código iframe do Panda Video
 * @returns Objeto com ID do vídeo, URL e URL da miniatura, ou null se inválido
 */
export const extractPandaVideoInfo = (embedCode: string): {
  videoId: string;
  url: string;
  thumbnailUrl: string;
} | null => {
  if (!embedCode || typeof embedCode !== 'string') {
    return null;
  }

  try {
    // Extrair URL do iframe
    const srcMatch = embedCode.match(/src=["'](https:\/\/[^"']+)["']/i);
    if (!srcMatch || !srcMatch[1]) {
      return null;
    }

    const iframeSrc = srcMatch[1];
    
    // Extrair ID do vídeo da URL
    // Padrão: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=VIDEO_ID
    let videoId = '';
    
    const embedParamMatch = iframeSrc.match(/embed\/\?v=([^&]+)/);
    if (embedParamMatch && embedParamMatch[1]) {
      videoId = embedParamMatch[1];
    } else {
      // Outro padrão comum: https://player-vz-*.tv.pandavideo.com.br/embed/VIDEO_ID
      const altMatch = iframeSrc.match(/\/embed\/([^/?]+)/);
      if (altMatch && altMatch[1]) {
        videoId = altMatch[1];
      } else {
        // Verificar se o ID do vídeo está diretamente na URL (formato UUID)
        const directIdMatch = iframeSrc.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (directIdMatch && directIdMatch[1]) {
          videoId = directIdMatch[1];
        }
      }
    }
    
    if (!videoId) {
      console.warn("Não foi possível extrair ID do vídeo Panda:", iframeSrc);
      return null;
    }

    // Construir URL da miniatura (thumbnail)
    const thumbnailUrl = `https://player-vz-d6ebf577-797.tv.pandavideo.com.br/thumbnail/${videoId}.jpg`;
    
    return {
      videoId,
      url: iframeSrc,
      thumbnailUrl
    };
  } catch (error) {
    console.error("Erro ao extrair informações do vídeo Panda:", error);
    return null;
  }
};
