// Vamos criar ou atualizar este arquivo

import { supabase } from '@/lib/supabase';

// Listagem dos buckets necessários para o sistema de aprendizado
const LEARNING_BUCKETS = [
  'learning_videos',     // Vídeos de aulas
  'learning_resources',  // Outros recursos (PDFs, documentos, imagens)
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
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true, // Tornando público para facilitar acesso aos recursos
          fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600 // 300MB para vídeos, 100MB para outros
        });
        
        if (error) {
          console.error(`Erro ao criar bucket ${bucketName}:`, error);
          creationErrors.push(bucketName);
        } else {
          console.log(`Bucket ${bucketName} criado com sucesso`);
          readyBuckets.push(bucketName);
          createdCount++;
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
 * Formata a duração do vídeo em segundos para formato legível (MM:SS)
 */
export const formatVideoDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
