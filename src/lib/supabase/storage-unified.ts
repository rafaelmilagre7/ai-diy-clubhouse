import { supabase } from "./client";
import { STORAGE_BUCKETS } from "./config";

/**
 * Configuração unificada de buckets de storage
 */
export const BUCKET_CONFIGS = {
  [STORAGE_BUCKETS.LEARNING_MATERIALS]: {
    maxSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'],
    folder: 'materials'
  },
  [STORAGE_BUCKETS.COURSE_IMAGES]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    folder: 'images'
  },
  [STORAGE_BUCKETS.LEARNING_VIDEOS]: {
    maxSize: 300 * 1024 * 1024, // 300MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    folder: 'videos'
  },
  [STORAGE_BUCKETS.SOLUTION_FILES]: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'],
    folder: 'files'
  },
  [STORAGE_BUCKETS.FALLBACK]: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: null, // Aceita qualquer tipo
    folder: 'general'
  }
} as const;

/**
 * Valida um arquivo contra as configurações do bucket
 */
export const validateFileForBucket = (file: File, bucketName: string): { valid: boolean; error?: string } => {
  const config = BUCKET_CONFIGS[bucketName as keyof typeof BUCKET_CONFIGS];
  
  if (!config) {
    return { valid: false, error: `Bucket ${bucketName} não reconhecido` };
  }

  // Verificar tamanho
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB` };
  }

  // Verificar tipo MIME
  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de arquivo não permitido: ${file.type}` };
  }

  // Verificar extensões perigosas
  const dangerousExtensions = /\.(exe|bat|cmd|scr|com|pif|jar|war)$/i;
  if (dangerousExtensions.test(file.name)) {
    return { valid: false, error: 'Tipo de arquivo executável não permitido' };
  }

  return { valid: true };
};

/**
 * Verifica se um bucket existe e está acessível
 */
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    return !error && !!data;
  } catch (error) {
    console.warn(`Erro ao verificar bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Upload unificado com fallback automático
 */
export const uploadFileUnified = async (
  file: File,
  bucketName: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<{ publicUrl: string; path: string }> => {
  // Validar arquivo
  const validation = validateFileForBucket(file, bucketName);
  if (!validation.valid) {
    throw new Error(validation.error || 'Arquivo inválido');
  }

  onProgress?.(5);

  // Gerar nome único
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const config = BUCKET_CONFIGS[bucketName as keyof typeof BUCKET_CONFIGS];
  const basePath = folder || config?.folder || '';
  const filePath = basePath ? `${basePath}/${uniqueFileName}` : uniqueFileName;

  onProgress?.(10);

  try {
    // Tentativa principal
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (data && !error) {
      onProgress?.(80);
      
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onProgress?.(100);
      
      return {
        publicUrl: publicUrlData.publicUrl,
        path: data.path
      };
    }

    // Se falhou, tentar fallback
    console.warn(`Upload principal falhou para ${bucketName}, tentando fallback:`, error);
    onProgress?.(30);

    const fallbackPath = `fallback/${bucketName}/${filePath}`;
    const { data: fallbackData, error: fallbackError } = await supabase.storage
      .from(STORAGE_BUCKETS.FALLBACK)
      .upload(fallbackPath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (fallbackError || !fallbackData) {
      throw new Error(fallbackError?.message || 'Falha no upload com fallback');
    }

    onProgress?.(80);
    
    const { data: fallbackUrlData } = supabase.storage
      .from(STORAGE_BUCKETS.FALLBACK)
      .getPublicUrl(fallbackData.path);

    onProgress?.(100);
    
    return {
      publicUrl: fallbackUrlData.publicUrl,
      path: fallbackData.path
    };

  } catch (error) {
    console.error('Erro no upload unificado:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido no upload');
  }
};

/**
 * Remove um arquivo do storage
 */
export const removeFileUnified = async (
  bucketName: string,
  filePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.warn(`Erro ao remover arquivo de ${bucketName}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    return false;
  }
};

/**
 * Lista arquivos de um bucket/pasta
 */
export const listFilesUnified = async (
  bucketName: string,
  folder?: string,
  limit = 100
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error(`Erro ao listar arquivos de ${bucketName}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
};