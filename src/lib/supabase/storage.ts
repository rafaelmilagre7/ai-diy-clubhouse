import { supabase } from './client';
import { STORAGE_BUCKETS } from './config';
import { createStoragePublicPolicy } from './rpc';

/**
 * Configura os buckets de armazenamento necessários para o módulo de aprendizado
 * com sistema de retry e feedback detalhado
 */
export async function setupLearningStorageBuckets(retryAttempts = 2) {
  try {
    const bucketsToCreate = [
      STORAGE_BUCKETS.VIDEOS,
      STORAGE_BUCKETS.SOLUTION_FILES,
      STORAGE_BUCKETS.PROFILE_AVATARS,
      STORAGE_BUCKETS.LEARNING_RESOURCES
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
    const failedBuckets = [];
    const errors = [];
    
    // Tentar criar ou confirmar cada bucket
    for (const bucketName of bucketsToCreate) {
      try {
        const exists = existingBucketsMap.has(bucketName);
        let bucketReady = false;
        let attemptCount = 0;
        
        if (exists) {
          console.log(`Bucket ${bucketName} já existe!`);
          bucketReady = true;
          results.push(true);
          readyBuckets.push(bucketName);
          continue; // Pular para o próximo bucket se este já existe
        }
        
        // Loop de tentativas para criar o bucket
        while (!bucketReady && attemptCount <= retryAttempts) {
          attemptCount++;
          
          try {
            console.log(`Tentativa ${attemptCount}/${retryAttempts+1} de criar bucket ${bucketName}`);
            
            const { error } = await supabase.storage.createBucket(bucketName, {
              public: true,
              fileSizeLimit: 314572800 // 300MB
            });
            
            if (error) {
              console.warn(`Tentativa ${attemptCount} falhou para bucket ${bucketName}:`, error);
              errors.push(error);
              
              if (attemptCount <= retryAttempts) {
                // Aguardar um pouco antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 500 * attemptCount));
                continue;
              } else {
                // Todas as tentativas falharam
                throw error;
              }
            }
            
            // Bucket criado com sucesso
            console.log(`Bucket ${bucketName} criado com sucesso na tentativa ${attemptCount}!`);
            bucketReady = true;
            
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
            
            break; // Sair do loop de tentativas
          } catch (attemptError) {
            if (attemptCount > retryAttempts) {
              console.error(`Todas as ${retryAttempts+1} tentativas falharam para bucket ${bucketName}:`, attemptError);
              failedBuckets.push(bucketName);
              results.push(false);
            }
          }
        }
      } catch (bucketError) {
        console.error(`Erro ao processar bucket ${bucketName}:`, bucketError);
        failedBuckets.push(bucketName);
        results.push(false);
        errors.push(bucketError);
      }
    }
    
    const allSuccess = results.length === bucketsToCreate.length && results.every(result => result);
    
    // Mais detalhes no resultado para ajudar no diagnóstico
    const resultDetails = {
      success: allSuccess,
      readyBuckets,
      failedBuckets,
      bucketsTotal: bucketsToCreate.length,
      bucketsReady: readyBuckets.length,
      bucketsFailed: failedBuckets.length,
      errors: errors.length > 0 ? errors : undefined,
    };
    
    if (allSuccess) {
      console.log("Todos os buckets foram configurados com sucesso!", resultDetails);
      return {
        ...resultDetails,
        message: 'Todos os buckets de armazenamento foram configurados com sucesso'
      };
    } else if (readyBuckets.length > 0) {
      console.log(`${readyBuckets.length} de ${bucketsToCreate.length} buckets foram configurados`, resultDetails);
      return {
        ...resultDetails,
        success: false,
        message: `Configuração parcial: ${readyBuckets.length} de ${bucketsToCreate.length} buckets estão prontos`
      };
    } else {
      console.error("Nenhum bucket foi configurado com sucesso", resultDetails);
      return {
        ...resultDetails,
        success: false,
        message: 'Falha ao configurar qualquer bucket de armazenamento. Verifique suas permissões ou tente novamente mais tarde.'
      };
    }
  } catch (error) {
    console.error('Erro ao configurar buckets de armazenamento:', error);
    return {
      success: false,
      readyBuckets: [],
      error,
      message: `Falha ao configurar buckets de armazenamento: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Garante que um bucket existe, criando-o se necessário
 * com sistema de retry e configuração automática de políticas
 */
export async function ensureBucketExists(bucketName: string, retryAttempts = 1): Promise<boolean> {
  try {
    console.log(`Verificando se o bucket ${bucketName} existe...`);
    
    // Primeiro, verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Erro ao listar buckets para verificar ${bucketName}:`, listError);
      return false;
    }
    
    // Se o bucket existe, retornar sucesso
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    if (exists) {
      console.log(`Bucket ${bucketName} já existe.`);
      return true;
    }
    
    // Se não existe, tentar criar
    console.log(`Bucket ${bucketName} não encontrado, tentando criar...`);
    
    let attemptCount = 0;
    let success = false;
    
    // Loop de tentativas para criar o bucket
    while (!success && attemptCount <= retryAttempts) {
      attemptCount++;
      console.log(`Tentativa ${attemptCount}/${retryAttempts+1} de criar bucket ${bucketName}`);
      
      try {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 314572800 // 300MB
        });
        
        if (error) {
          console.warn(`Tentativa ${attemptCount} falhou para bucket ${bucketName}:`, error);
          
          if (attemptCount <= retryAttempts) {
            // Aguardar um pouco antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 500 * attemptCount));
            continue;
          } else {
            // Todas as tentativas falharam
            throw error;
          }
        }
        
        // Bucket criado com sucesso, tentar aplicar política
        console.log(`Bucket ${bucketName} criado com sucesso na tentativa ${attemptCount}!`);
        
        try {
          await createStoragePublicPolicy(bucketName);
          console.log(`Políticas públicas aplicadas ao bucket ${bucketName}`);
        } catch (policyError) {
          console.error(`Erro ao aplicar políticas ao bucket ${bucketName}:`, policyError);
          // Mesmo com erro na política, consideramos o bucket criado
        }
        
        success = true;
        break;
      } catch (error) {
        if (attemptCount > retryAttempts) {
          console.error(`Todas as ${retryAttempts+1} tentativas falharam para bucket ${bucketName}:`, error);
          throw error;
        }
      }
    }
    
    return success;
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
