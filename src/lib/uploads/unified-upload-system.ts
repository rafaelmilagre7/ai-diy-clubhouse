/**
 * SISTEMA UNIFICADO DE UPLOADS - LOVABLE PLATFORM
 * 
 * Este sistema centraliza TODOS os uploads da plataforma com:
 * - Configuração unificada de buckets
 * - Validações consistentes
 * - Fallbacks automáticos
 * - Compatibilidade total com código existente
 */

import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS, MAX_UPLOAD_SIZES } from '@/lib/supabase/config';

// =============================================
// CONFIGURAÇÕES CENTRALIZADAS POR CONTEXTO
// =============================================

export const UPLOAD_CONTEXTS = {
  // Soluções (Admin)
  SOLUTION_COVER: {
    bucket: STORAGE_BUCKETS.COURSE_IMAGES,
    folder: 'solution-covers',
    maxSize: MAX_UPLOAD_SIZES.COVER,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Capas de soluções'
  },
  SOLUTION_RESOURCES: {
    bucket: STORAGE_BUCKETS.SOLUTION_FILES,
    folder: 'resources',
    maxSize: 300, // 300MB para documentos grandes
    allowedTypes: ['*'], // Aceitar todos os tipos
    description: 'Materiais e recursos de soluções'
  },
  SOLUTION_CONTENT_IMAGES: {
    bucket: STORAGE_BUCKETS.COURSE_IMAGES,
    folder: 'solution-content',
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Imagens do conteúdo de soluções'
  },

  // Learning Management System
  COURSE_COVERS: {
    bucket: STORAGE_BUCKETS.LEARNING_COVERS,
    folder: 'covers',
    maxSize: MAX_UPLOAD_SIZES.COVER,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    description: 'Capas de cursos'
  },
  LESSON_COVERS: {
    bucket: STORAGE_BUCKETS.LEARNING_COVERS,
    folder: 'lessons',
    maxSize: MAX_UPLOAD_SIZES.COVER,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    description: 'Capas de aulas'
  },
  LEARNING_MATERIALS: {
    bucket: STORAGE_BUCKETS.LEARNING_MATERIALS,
    folder: 'documents',
    maxSize: MAX_UPLOAD_SIZES.DOCUMENT,
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'],
    description: 'Materiais de aprendizado'
  },
  LEARNING_VIDEOS: {
    bucket: STORAGE_BUCKETS.LEARNING_VIDEOS,
    folder: 'lessons',
    maxSize: MAX_UPLOAD_SIZES.VIDEO,
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    description: 'Vídeos de aulas'
  },

  // Ferramentas e Perfis
  TOOL_LOGOS: {
    bucket: STORAGE_BUCKETS.TOOL_LOGOS,
    folder: 'logos',
    maxSize: MAX_UPLOAD_SIZES.LOGO,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    description: 'Logos de ferramentas'
  },
  PROFILE_PICTURES: {
    bucket: STORAGE_BUCKETS.PROFILE_PICTURES,
    folder: 'avatars',
    maxSize: MAX_UPLOAD_SIZES.AVATAR,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Fotos de perfil'
  },

  // Comunidade
  COMMUNITY_IMAGES: {
    bucket: STORAGE_BUCKETS.COMMUNITY_IMAGES,
    folder: 'posts',
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Imagens da comunidade'
  },

  // Eventos
  EVENT_COVERS: {
    bucket: STORAGE_BUCKETS.COURSE_IMAGES, // Reutilizar bucket existente
    folder: 'events',
    maxSize: MAX_UPLOAD_SIZES.COVER,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Capas de eventos'
  },

  // Certificados
  CERTIFICATES: {
    bucket: STORAGE_BUCKETS.CERTIFICATES,
    folder: 'generated',
    maxSize: MAX_UPLOAD_SIZES.CERTIFICATE,
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
    description: 'Certificados'
  },

  // Fallback Geral
  GENERAL: {
    bucket: STORAGE_BUCKETS.FALLBACK,
    folder: 'general',
    maxSize: 100, // 100MB padrão
    allowedTypes: ['*'],
    description: 'Armazenamento geral'
  }
} as const;

// =============================================
// TIPOS E INTERFACES
// =============================================

export type UploadContext = keyof typeof UPLOAD_CONTEXTS;

export interface UploadConfig {
  bucket: string;
  folder: string;
  maxSize: number;
  allowedTypes: readonly string[];
  description: string;
}

export interface UploadResult {
  success: true;
  publicUrl: string;
  path: string;
  fileName: string;
  fileSize: number;
}

export interface UploadError {
  success: false;
  error: string;
  code?: string;
}

export type UploadResponse = UploadResult | UploadError;

export interface UploadOptions {
  context?: UploadContext;
  customBucket?: string;
  customFolder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  abortSignal?: AbortSignal;
}

// =============================================
// VALIDAÇÃO UNIFICADA
// =============================================

export const validateFile = (file: File, config: UploadConfig): UploadError | null => {
  // Validar tamanho
  const maxSizeBytes = config.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      success: false,
      error: `Arquivo muito grande. Tamanho máximo: ${config.maxSize}MB`,
      code: 'FILE_TOO_LARGE'
    };
  }

  // Validar tipo
  if (config.allowedTypes[0] !== '*' && !config.allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${config.allowedTypes.join(', ')}`,
      code: 'INVALID_FILE_TYPE'
    };
  }

  // Validar extensão para segurança
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.jar', '.war'];
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      success: false,
      error: 'Tipo de arquivo executável não permitido',
      code: 'DANGEROUS_FILE_TYPE'
    };
  }

  return null;
};

// =============================================
// VERIFICAÇÃO E CRIAÇÃO DE BUCKETS
// =============================================

export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('[UPLOAD_SYSTEM] Erro ao listar buckets:', error);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`[UPLOAD_SYSTEM] Criando bucket: ${bucketName}`);
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 300 * 1024 * 1024, // 300MB
        allowedMimeTypes: undefined // Permitir todos os tipos
      });

      if (createError) {
        console.error(`[UPLOAD_SYSTEM] Erro ao criar bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`[UPLOAD_SYSTEM] Bucket ${bucketName} criado com sucesso`);
    }

    return true;
  } catch (error) {
    console.error(`[UPLOAD_SYSTEM] Erro ao verificar bucket ${bucketName}:`, error);
    return false;
  }
};

// =============================================
// FUNÇÃO PRINCIPAL DE UPLOAD
// =============================================

export const unifiedUpload = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResponse> => {
  console.log('[UPLOAD_SYSTEM] Iniciando upload unificado:', file.name);
  
  try {
    // Determinar configuração
    let config: UploadConfig;
    
    if (options.context) {
      config = UPLOAD_CONTEXTS[options.context];
    } else if (options.customBucket) {
      config = {
        bucket: options.customBucket,
        folder: options.customFolder || 'uploads',
        maxSize: options.maxSize || 100,
        allowedTypes: options.allowedTypes || ['*'],
        description: 'Upload customizado'
      };
    } else {
      config = UPLOAD_CONTEXTS.GENERAL;
    }

    console.log('[UPLOAD_SYSTEM] Configuração:', config);

    // Validar arquivo
    const validationError = validateFile(file, config);
    if (validationError) {
      console.error('[UPLOAD_SYSTEM] Validação falhou:', validationError);
      return validationError;
    }

    options.onProgress?.(10);

    // Verificar/criar bucket
    const bucketReady = await ensureBucketExists(config.bucket);
    if (!bucketReady) {
      console.warn(`[UPLOAD_SYSTEM] Bucket ${config.bucket} não disponível, usando fallback`);
      config = UPLOAD_CONTEXTS.GENERAL;
      
      const fallbackReady = await ensureBucketExists(config.bucket);
      if (!fallbackReady) {
        return {
          success: false,
          error: 'Não foi possível inicializar o armazenamento',
          code: 'STORAGE_UNAVAILABLE'
        };
      }
    }

    options.onProgress?.(30);

    // Gerar nome único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${timestamp}-${randomId}.${fileExtension}`;
    const filePath = config.folder ? `${config.folder}/${fileName}` : fileName;

    console.log('[UPLOAD_SYSTEM] Upload para:', config.bucket, filePath);

    options.onProgress?.(50);

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[UPLOAD_SYSTEM] Erro no upload:', error);
      return {
        success: false,
        error: `Erro no upload: ${error.message}`,
        code: 'UPLOAD_FAILED'
      };
    }

    options.onProgress?.(80);

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(data.path);

    options.onProgress?.(100);

    console.log('[UPLOAD_SYSTEM] Upload concluído:', publicUrl);

    return {
      success: true,
      publicUrl,
      path: data.path,
      fileName: file.name,
      fileSize: file.size
    };

  } catch (error: any) {
    console.error('[UPLOAD_SYSTEM] Erro inesperado:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado durante o upload',
      code: 'UNEXPECTED_ERROR'
    };
  }
};

// =============================================
// FUNÇÕES DE CONVENIÊNCIA
// =============================================

export const uploadSolutionCover = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'SOLUTION_COVER', onProgress });

export const uploadSolutionResource = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'SOLUTION_RESOURCES', onProgress });

export const uploadCourseCover = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'COURSE_COVERS', onProgress });

export const uploadLearningMaterial = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'LEARNING_MATERIALS', onProgress });

export const uploadToolLogo = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'TOOL_LOGOS', onProgress });

export const uploadProfilePicture = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'PROFILE_PICTURES', onProgress });

export const uploadCommunityImage = (file: File, onProgress?: (progress: number) => void) =>
  unifiedUpload(file, { context: 'COMMUNITY_IMAGES', onProgress });

// =============================================
// COMPATIBILIDADE COM SISTEMA ANTIGO
// =============================================

export const mapLegacyBucketToContext = (bucketName: string): UploadContext => {
  const mappings: Record<string, UploadContext> = {
    'course_images': 'COURSE_COVERS',
    'solution_files': 'SOLUTION_RESOURCES',
    'learning_materials': 'LEARNING_MATERIALS',
    'learning_videos': 'LEARNING_VIDEOS',
    'learning_covers': 'COURSE_COVERS',
    'tool_logos': 'TOOL_LOGOS',
    'tool-logos': 'TOOL_LOGOS',
    'profile-pictures': 'PROFILE_PICTURES',
    'community_images': 'COMMUNITY_IMAGES',
    'certificates': 'CERTIFICATES'
  };

  return mappings[bucketName] || 'GENERAL';
};

export const legacyUpload = async (
  file: File,
  bucketName: string,
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  console.log('[UPLOAD_SYSTEM] Upload legado detectado, convertendo para sistema unificado');
  
  const context = mapLegacyBucketToContext(bucketName);
  
  return unifiedUpload(file, {
    context,
    customFolder: folder,
    onProgress
  });
};