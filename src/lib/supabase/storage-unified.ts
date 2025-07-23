
import { supabase } from './client';
import { MAX_UPLOAD_SIZES, STORAGE_BUCKETS } from './config';

// Configurações de buckets unificados com todos os buckets essenciais
export const BUCKET_CONFIGS = {
  // Buckets para o LMS
  [STORAGE_BUCKETS.LEARNING_MATERIALS]: {
    maxSize: MAX_UPLOAD_SIZES.DOCUMENT,
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    description: 'Materiais de aprendizado'
  },
  [STORAGE_BUCKETS.COURSE_IMAGES]: {
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Imagens de cursos'
  },
  [STORAGE_BUCKETS.LEARNING_VIDEOS]: {
    maxSize: MAX_UPLOAD_SIZES.VIDEO,
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    description: 'Vídeos de aprendizado'
  },
  [STORAGE_BUCKETS.LEARNING_COVERS]: {
    maxSize: MAX_UPLOAD_SIZES.COVER,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    description: 'Capas de cursos e lições'
  },
  [STORAGE_BUCKETS.SOLUTION_FILES]: {
    maxSize: 300, // 300MB
    allowedTypes: ['*'], // Aceitar todos os tipos de arquivo
    description: 'Arquivos de soluções'
  },
  
  // Buckets para ferramentas e perfis
  [STORAGE_BUCKETS.TOOL_LOGOS]: {
    maxSize: MAX_UPLOAD_SIZES.LOGO,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    description: 'Logos de ferramentas'
  },
  [STORAGE_BUCKETS.PROFILE_PICTURES]: {
    maxSize: MAX_UPLOAD_SIZES.AVATAR,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Imagens de perfil dos usuários'
  },
  
  // Buckets para comunidade e certificados
  [STORAGE_BUCKETS.COMMUNITY_IMAGES]: {
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Imagens para posts da comunidade'
  },
  [STORAGE_BUCKETS.CERTIFICATES]: {
    maxSize: MAX_UPLOAD_SIZES.CERTIFICATE,
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
    description: 'Certificados de cursos e implementações'
  },
  
  // Bucket de fallback
  [STORAGE_BUCKETS.FALLBACK]: {
    maxSize: MAX_UPLOAD_SIZES.DOCUMENT,
    allowedTypes: ['*'],
    description: 'Storage geral para emergências'
  }
};

export const validateFileForBucket = (file: File, bucketName: string) => {
  const config = BUCKET_CONFIGS[bucketName];
  
  if (!config) {
    console.warn(`[STORAGE] Bucket ${bucketName} não configurado, usando fallback`);
    return validateFileForBucket(file, STORAGE_BUCKETS.FALLBACK);
  }
  
  // Verificar tamanho
  const maxSizeBytes = config.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${config.maxSize}MB`
    };
  }
  
  // Verificar tipo
  if (config.allowedTypes[0] !== '*' && !config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    return buckets?.some(bucket => bucket.name === bucketName) || false;
  } catch (error) {
    console.error(`[STORAGE] Erro ao verificar bucket ${bucketName}:`, error);
    return false;
  }
};

export const uploadFileUnified = async (
  file: File,
  bucketName: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<{ publicUrl: string; path: string }> => {
  console.log(`[STORAGE_UNIFIED] Iniciando upload para bucket: ${bucketName}`);
  
  // Validar arquivo
  const validation = validateFileForBucket(file, bucketName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  onProgress?.(10);
  
  // Verificar se bucket existe, senão usar fallback
  let targetBucket = bucketName;
  const bucketExists = await checkBucketExists(bucketName);
  
  if (!bucketExists) {
    console.warn(`[STORAGE_UNIFIED] Bucket ${bucketName} não existe, usando fallback`);
    targetBucket = STORAGE_BUCKETS.FALLBACK;
    
    // Verificar se fallback existe
    const fallbackExists = await checkBucketExists(targetBucket);
    if (!fallbackExists) {
      // Tentar criar bucket original
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: BUCKET_CONFIGS[bucketName]?.maxSize * 1024 * 1024 || 50 * 1024 * 1024,
        allowedMimeTypes: BUCKET_CONFIGS[bucketName]?.allowedTypes.filter(type => type !== '*') || undefined
      });
      
      if (!createError) {
        targetBucket = bucketName;
        console.log(`[STORAGE_UNIFIED] Bucket ${bucketName} criado com sucesso`);
      }
    }
  }
  
  onProgress?.(30);
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const fileExtension = file.name.split('.').pop() || '';
  const fileName = `${timestamp}-${randomId}.${fileExtension}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;
  
  onProgress?.(50);
  
  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(targetBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    console.error(`[STORAGE_UNIFIED] Erro no upload:`, error);
    throw new Error(`Erro no upload: ${error.message}`);
  }
  
  onProgress?.(80);
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(data.path);
  
  onProgress?.(100);
  
  console.log(`[STORAGE_UNIFIED] Upload concluído: ${publicUrl}`);
  
  return {
    publicUrl,
    path: data.path
  };
};

export const removeFileUnified = async (bucketName: string, filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);
  
  if (error) {
    throw new Error(`Erro ao remover arquivo: ${error.message}`);
  }
};

export const listFilesUnified = async (
  bucketName: string, 
  folder?: string
): Promise<any[]> => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folder);
  
  if (error) {
    throw new Error(`Erro ao listar arquivos: ${error.message}`);
  }
  
  return data || [];
};
