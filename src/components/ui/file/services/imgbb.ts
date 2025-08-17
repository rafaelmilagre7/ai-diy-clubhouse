
/**
 * DEPRECIADO: Serviço ImgBB com chave exposta
 * 
 * Este arquivo foi depreciado por expor chaves de API no frontend.
 * Use a Edge Function 'image-upload' que mantém as chaves seguras.
 * 
 * @deprecated Use supabase.functions.invoke('image-upload')
 */

import { logger } from '@/utils/logger';

export const uploadImageToImgBB = async (
  file: File,
  apiKey: string,
  onProgressUpdate?: (progress: number) => void
) => {
  logger.error('uploadImageToImgBB está depreciado', {
    component: 'DEPRECATED_IMGBB_SERVICE',
    message: 'Use Edge Function image-upload para uploads seguros',
    security: 'API key exposta no frontend'
  });
  
  throw new Error(
    'uploadImageToImgBB foi depreciado por segurança. Use a Edge Function image-upload.'
  );
};

