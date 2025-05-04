// Vamos criar ou atualizar este arquivo

import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS, FILE_SIZE_LIMITS } from './config';

// Listagem dos buckets necessários para o sistema de aprendizado
const LEARNING_BUCKETS = [
  'learning_videos',     // Vídeos de aulas
  'learning_resources',  // Outros recursos (PDFs, documentos, imagens)
  'learning_covers',     // Imagens de capa
  'learning_images',     // Imagens gerais
  'solution_files',      // Arquivos de solução (usado como fallback)
];

/**
 * Configura os buckets necessários para armazenamento de recursos de aprendizado
 * @returns Objeto com status de configuração
 */
export const setupLearningStorageBuckets = async () => {
  try {
    // Verificar os buckets existentes
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return { 
        success: false, 
        message: "Não foi possível listar os buckets existentes", 
        readyBuckets: [] 
      };
    }
    
    // Lista de buckets já existentes
    const existingBucketNames = existingBuckets?.map(bucket => bucket.name) || [];
    console.log("Buckets existentes:", existingBucketNames);
    
    // Buckets que precisamos garantir que existam
    const readyBuckets: string[] = [];
    const missingBuckets: string[] = [];
    
    // Verificar quais buckets existem e quais precisam ser criados
    for (const bucketName of LEARNING_BUCKETS) {
      if (existingBucketNames.includes(bucketName)) {
        readyBuckets.push(bucketName);
      } else {
        missingBuckets.push(bucketName);
      }
    }
    
    // Se todos os buckets necessários já existem, retornar sucesso
    if (missingBuckets.length === 0) {
      return { 
        success: true, 
        message: "Todos os buckets necessários já existem", 
        readyBuckets
      };
    }
    
    // Para cada bucket que não existe, tenta criar
    let createdCount = 0;
    const creationErrors: string[] = [];
    
    for (const bucketName of missingBuckets) {
      try {
        // Definir limite de tamanho de acordo com o tipo do bucket
        let fileSizeLimit = FILE_SIZE_LIMITS.DEFAULT;
        if (bucketName.includes('video')) {
          fileSizeLimit = FILE_SIZE_LIMITS.VIDEOS;
        } else if (bucketName.includes('image') || bucketName.includes('cover')) {
          fileSizeLimit = FILE_SIZE_LIMITS.IMAGES;
        } else if (bucketName.includes('resource') || bucketName.includes('file')) {
          fileSizeLimit = FILE_SIZE_LIMITS.DOCUMENTS;
        }
        
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true, // Tornando público para facilitar acesso aos recursos
          fileSizeLimit: fileSizeLimit
        });
        
        if (error) {
          console.error(`Erro ao criar bucket ${bucketName}:`, error);
          creationErrors.push(bucketName);
        } else {
          console.log(`Bucket ${bucketName} criado com sucesso com limite de ${fileSizeLimit} bytes`);
          readyBuckets.push(bucketName);
          createdCount++;
          
          // Configurar política pública para o bucket - Corrigida a referência aqui
          await createStoragePublicPolicy(bucketName);
        }
      } catch (err) {
        console.error(`Erro ao criar bucket ${bucketName}:`, err);
        creationErrors.push(bucketName);
      }
    }
    
    // Se pelo menos um bucket foi criado, consideramos parcialmente bem-sucedido
    if (createdCount > 0) {
      return {
        success: creationErrors.length === 0,
        partial: creationErrors.length > 0,
        message: creationErrors.length > 0 
          ? `Alguns buckets não puderam ser criados: ${creationErrors.join(', ')}`
          : `Todos os ${createdCount} buckets foram criados com sucesso`,
        readyBuckets
      };
    }
    
    // Se nenhum bucket pôde ser criado, retornar erro
    if (readyBuckets.length === 0) {
      return {
        success: false,
        message: "Não foi possível criar nenhum bucket de armazenamento",
        readyBuckets: []
      };
    }
    
    // Retorno padrão indicando status misto
    return {
      success: false,
      message: `${readyBuckets.length} buckets disponíveis, ${creationErrors.length} não puderam ser criados`,
      readyBuckets
    };
    
  } catch (error) {
    console.error("Erro na configuração de buckets:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido ao configurar buckets",
      readyBuckets: []
    };
  }
};

/**
 * Verifica se um bucket existe e tenta criá-lo se necessário
 * @param bucketName Nome do bucket a verificar/criar
 * @returns true se o bucket está disponível, false caso contrário
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Verificar os buckets existentes
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return false;
    }
    
    // Lista de buckets já existentes
    const existingBucketNames = existingBuckets?.map(bucket => bucket.name) || [];
    
    // Se o bucket já existe, retornar sucesso
    if (existingBucketNames.includes(bucketName)) {
      console.log(`Bucket ${bucketName} já existe`);
      return true;
    }
    
    // Determinar limite de tamanho com base no nome do bucket
    let fileSizeLimit = FILE_SIZE_LIMITS.DEFAULT;
    if (bucketName.includes('video')) {
      fileSizeLimit = FILE_SIZE_LIMITS.VIDEOS;
    } else if (bucketName.includes('image') || bucketName.includes('cover')) {
      fileSizeLimit = FILE_SIZE_LIMITS.IMAGES;
    } else if (bucketName.includes('resource') || bucketName.includes('file')) {
      fileSizeLimit = FILE_SIZE_LIMITS.DOCUMENTS;
    }
    
    // Tentar criar o bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: fileSizeLimit
    });
    
    if (error) {
      console.error(`Erro ao criar bucket ${bucketName}:`, error);
      return false;
    }
    
    console.log(`Bucket ${bucketName} criado com sucesso com limite de ${fileSizeLimit} bytes`);
    
    // Configurar políticas de acesso público - Corrigida a referência aqui
    await createStoragePublicPolicy(bucketName);
    
    return true;
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Extrai o ID de um vídeo do YouTube a partir da URL
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // Padrões de URL do YouTube
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao extrair ID do YouTube:", error);
    return null;
  }
};

/**
 * Gera URL da thumbnail de um vídeo do YouTube
 * @param url URL do vídeo do YouTube
 * @returns URL da thumbnail ou null
 */
export const getYoutubeThumbnailUrl = (url: string): string | null => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  
  // URL da thumbnail de alta qualidade do YouTube
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Upload de arquivo para o Supabase Storage com tratamento de erros e fallback
 * @param file Arquivo para upload
 * @param bucketName Nome do bucket principal
 * @param folderPath Pasta dentro do bucket (opcional)
 * @param onProgress Callback de progresso (opcional)
 * @param fallbackBucket Nome do bucket alternativo (opcional)
 * @returns Objeto com dados do upload bem-sucedido
 */
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgress?: (progress: number) => void,
  fallbackBucket?: string
): Promise<{ path: string; publicUrl: string }> => {
  // Validar tamanho do arquivo antes do upload
  let maxFileSize = FILE_SIZE_LIMITS.DEFAULT;
  
  // Determinar limite baseado no tipo de bucket
  if (bucketName.includes('video')) {
    maxFileSize = FILE_SIZE_LIMITS.VIDEOS;
  } else if (bucketName.includes('image') || bucketName.includes('cover')) {
    maxFileSize = FILE_SIZE_LIMITS.IMAGES;
  } else if (bucketName.includes('resource') || bucketName.includes('file')) {
    maxFileSize = FILE_SIZE_LIMITS.DOCUMENTS;
  }
  
  if (file.size > maxFileSize) {
    const sizeMB = maxFileSize / (1024 * 1024);
    throw new Error(`O arquivo é muito grande (${(file.size / (1024 * 1024)).toFixed(2)}MB). O tamanho máximo permitido é ${sizeMB}MB.`);
  }
  
  // Gerar um nome único para o arquivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
  
  console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}, arquivo: ${fileName}`);
  
  try {
    if (onProgress) onProgress(10);
    
    // Verificar se o bucket existe
    const bucketExists = await ensureBucketExists(bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não disponível. Tentando bucket alternativo.`);
      
      // Se um bucket alternativo foi fornecido e o principal falhou
      if (fallbackBucket) {
        const fallbackExists = await ensureBucketExists(fallbackBucket);
        
        if (fallbackExists) {
          console.log(`Usando bucket de fallback: ${fallbackBucket}`);
          const fallbackPath = `${bucketName}/${folderPath}/${fileName}`.replace(/\/+/g, '/');
          
          // Upload para o bucket alternativo
          const { data, error } = await supabase.storage
            .from(fallbackBucket)
            .upload(fallbackPath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (error) throw error;
          
          if (onProgress) onProgress(100);
          
          // Obter a URL pública
          const { data: urlData } = supabase.storage
            .from(fallbackBucket)
            .getPublicUrl(fallbackPath);
          
          return {
            path: fallbackPath,
            publicUrl: urlData.publicUrl
          };
        } else {
          throw new Error(`Nem o bucket principal nem o alternativo estão disponíveis`);
        }
      } else {
        throw new Error(`Bucket ${bucketName} não está disponível e nenhum fallback foi fornecido`);
      }
    }
    
    // Se o bucket principal existe, fazer o upload para ele
    if (onProgress) onProgress(30);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    if (onProgress) onProgress(100);
    
    // Obter a URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return {
      path: data.path,
      publicUrl: urlData.publicUrl
    };
    
  } catch (error: any) {
    // Melhorar a mensagem de erro para o usuário
    let errorMessage = `Erro no upload: ${error.message}`;
    
    // Verificar se o erro está relacionado ao tamanho do arquivo
    if (error.message && error.message.includes('size')) {
      errorMessage = `O arquivo excede o tamanho máximo permitido (${(maxFileSize / (1024 * 1024)).toFixed(2)}MB).`;
    }
    // Verificar se o erro está relacionado a permissões
    else if (error.message && (error.message.includes('permission') || error.message.includes('403'))) {
      errorMessage = 'Você não tem permissão para fazer upload neste bucket. Verifique se está autenticado.';
    }
    // Verificar se é um erro de conectividade
    else if (error.message && (error.message.includes('network') || error.message.includes('connection'))) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    console.error(`Erro detalhado no upload: ${error.message}`);
    throw new Error(errorMessage);
  }
};

/**
 * Configura políticas de acesso público ao Storage
 * @param bucketName Nome do bucket para configurar
 * @returns Objeto com status da operação
 */
export const createStoragePublicPolicy = async (bucketName: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log(`Tentando configurar políticas para bucket: ${bucketName}`);
    
    // Verificar se o bucket existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não encontrado. Tentando criar...`);
      // Determinar limite baseado no tipo de bucket
      let fileSizeLimit = FILE_SIZE_LIMITS.DEFAULT;
      
      if (bucketName.includes('video')) {
        fileSizeLimit = FILE_SIZE_LIMITS.VIDEOS;
      } else if (bucketName.includes('image') || bucketName.includes('cover')) {
        fileSizeLimit = FILE_SIZE_LIMITS.IMAGES;
      } else if (bucketName.includes('resource') || bucketName.includes('file')) {
        fileSizeLimit = FILE_SIZE_LIMITS.DOCUMENTS;
      } else if (bucketName === 'learning_resources') {
        fileSizeLimit = FILE_SIZE_LIMITS.DOCUMENTS; // Garantir que este bucket tenha limite apropriado
      }
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: fileSizeLimit
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        return { 
          success: false, 
          error: `Erro ao criar bucket: ${createError.message}` 
        };
      }
      
      console.log(`Bucket ${bucketName} criado com sucesso!`);
    }
    
    // Chamar a RPC para configurar políticas de acesso
    const { data, error } = await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
    
    if (error) {
      console.error('Erro ao configurar políticas:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    console.log(`Políticas configuradas com sucesso para o bucket ${bucketName}`);
    return { 
      success: true, 
      error: null 
    };
  } catch (err: any) {
    console.error('Exceção ao configurar políticas:', err);
    return {
      success: false,
      error: err.message || 'Erro desconhecido'
    };
  }
};

/**
 * Formata a duração do vídeo em segundos para formato legível (MM:SS)
 */
export const formatVideoDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
