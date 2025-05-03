
import { supabase } from './client';
import { STORAGE_BUCKETS } from './config';
import { createStoragePublicPolicy } from './rpc';

/**
 * Configura os buckets de armazenamento necessários para o módulo de aprendizado
 */
export async function setupLearningStorageBuckets() {
  try {
    const bucketsToCreate = [
      STORAGE_BUCKETS.VIDEOS,
      STORAGE_BUCKETS.SOLUTION_FILES,
      STORAGE_BUCKETS.PROFILE_AVATARS
    ];
    
    console.log("Tentando configurar buckets de armazenamento:", bucketsToCreate);
    
    // Primeiro verificamos se os buckets existem
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erro ao listar buckets:", listError);
      return {
        success: false,
        readyBuckets: [],
        error: listError,
        message: `Erro ao verificar buckets existentes: ${listError.message}`
      };
    }
    
    console.log("Buckets existentes:", existingBuckets?.map(b => b.name));
    
    // Mapeamento de buckets existentes para rápida verificação
    const existingBucketsMap = new Map();
    existingBuckets?.forEach(bucket => {
      existingBucketsMap.set(bucket.name, bucket);
    });
    
    // Array para armazenar resultados das operações de criação/verificação
    const results = [];
    const readyBuckets = [];
    
    // Tentar criar ou confirmar cada bucket
    for (const bucketName of bucketsToCreate) {
      try {
        const exists = existingBucketsMap.has(bucketName);
        
        if (!exists) {
          console.log(`Bucket ${bucketName} não existe, tentando criar...`);
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 314572800 // 300MB
          });
          
          if (error) {
            console.error(`Erro ao criar bucket ${bucketName}:`, error);
            results.push(false);
          } else {
            console.log(`Bucket ${bucketName} criado com sucesso!`);
            
            // Tentar aplicar políticas de acesso público
            try {
              await createStoragePublicPolicy(bucketName);
              console.log(`Políticas públicas aplicadas ao bucket ${bucketName}`);
              results.push(true);
              readyBuckets.push(bucketName);
            } catch (policyError) {
              console.error(`Erro ao aplicar políticas ao bucket ${bucketName}:`, policyError);
              // Mesmo com erro na política, consideramos o bucket criado
              results.push(true);
              readyBuckets.push(bucketName);
            }
          }
        } else {
          console.log(`Bucket ${bucketName} já existe!`);
          results.push(true);
          readyBuckets.push(bucketName);
        }
      } catch (bucketError) {
        console.error(`Erro ao processar bucket ${bucketName}:`, bucketError);
        results.push(false);
      }
    }
    
    const allSuccess = results.length === bucketsToCreate.length && results.every(result => result);
    
    if (allSuccess) {
      console.log("Todos os buckets foram configurados com sucesso!");
      return {
        success: true,
        readyBuckets,
        message: 'Todos os buckets de armazenamento foram configurados com sucesso'
      };
    } else if (readyBuckets.length > 0) {
      console.log(`${readyBuckets.length} de ${bucketsToCreate.length} buckets foram configurados`);
      return {
        success: false,
        readyBuckets,
        message: `Configuração parcial: ${readyBuckets.length} de ${bucketsToCreate.length} buckets estão prontos`
      };
    } else {
      console.error("Nenhum bucket foi configurado com sucesso");
      return {
        success: false,
        readyBuckets: [],
        message: 'Falha ao configurar qualquer bucket de armazenamento'
      };
    }
  } catch (error) {
    console.error('Erro ao configurar buckets de armazenamento:', error);
    return {
      success: false,
      readyBuckets: [],
      error,
      message: 'Falha ao configurar buckets de armazenamento'
    };
  }
}

/**
 * Garante que um bucket existe, criando-o se necessário
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (error) {
        console.error(`Erro ao criar bucket ${bucketName}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Extrai o ID de um vídeo do YouTube a partir da URL
 */
export function getYoutubeVideoId(url?: string): string | null {
  if (!url) return null;
  
  // Padrões comuns de URLs do YouTube
  const patterns = [
    // youtu.be/ID
    /youtu\.be\/([^?&#]+)/,
    // youtube.com/watch?v=ID
    /youtube\.com\/watch\?v=([^?&#]+)/,
    // youtube.com/embed/ID
    /youtube\.com\/embed\/([^?&#]+)/,
    // youtube.com/v/ID
    /youtube\.com\/v\/([^?&#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Obtém a URL da miniatura de um vídeo do YouTube
 */
export function getYoutubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Formata a duração do vídeo em formato legível (mm:ss ou hh:mm:ss)
 */
export function formatVideoDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
  
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

/**
 * Função auxiliar para adicionar zero à esquerda para valores menores que 10
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
