
// Definição dos buckets de armazenamento padronizados
export const STORAGE_BUCKETS = {
  // Buckets para o LMS
  LEARNING_MATERIALS: 'learning_materials',
  COURSE_IMAGES: 'course_images', 
  LEARNING_VIDEOS: 'learning_videos', // Padronizado com underscore
  LEARNING_COVERS: 'learning_covers',
  SOLUTION_FILES: 'solution_files',
  
  // Buckets para ferramentas e perfis
  TOOL_LOGOS: 'tool_logos', // Padronizado com underscore
  PROFILE_PICTURES: 'profile-pictures',
  
  // Buckets para comunidade e certificados
  COMMUNITY_IMAGES: 'community_images',
  CERTIFICATES: 'certificates',
  
  // Bucket de fallback para emergências
  FALLBACK: 'general_storage'
};

// Limites de tamanho de upload (em MB)
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5,       // 5MB para imagens gerais
  DOCUMENT: 25,   // 25MB para documentos
  VIDEO: 200,     // 200MB para vídeos
  AVATAR: 2,      // 2MB para avatares/perfil
  LOGO: 5,        // 5MB para logos de ferramentas
  COVER: 10,      // 10MB para capas de cursos
  CERTIFICATE: 50 // 50MB para certificados
};
