
import { supabase } from './client';
import { logger } from '@/utils/logger';

export const setupCertificatesStorage = async () => {
  try {
    // CORREÇÃO FASE 1: Usar método mais seguro que evita RLS em listBuckets
    logger.info('[CERTIFICATES-STORAGE] Configurando storage de certificados...');
    
    // Tentar acessar bucket diretamente em vez de listar todos
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('certificates');
    
    if (bucketError && !bucketError.message.includes('not found')) {
      logger.error('[CERTIFICATES-STORAGE] Erro ao verificar bucket:', bucketError);
      return false;
    }
    
    // Se bucket não existe, tentar criar
    if (bucketError?.message.includes('not found')) {
      logger.info('[CERTIFICATES-STORAGE] Criando bucket certificates...');
      
      const { error: createError } = await supabase.storage.createBucket('certificates', {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        if (createError.message.includes('already exists')) {
          logger.info('[CERTIFICATES-STORAGE] Bucket certificates já existe');
          return true;
        }
        logger.error('[CERTIFICATES-STORAGE] Erro ao criar bucket certificates:', createError);
        return false;
      }
      
      logger.info('[CERTIFICATES-STORAGE] Bucket certificates criado com sucesso');
    } else {
      logger.info('[CERTIFICATES-STORAGE] Bucket certificates já existe');
    }
    
    return true;
  } catch (error) {
    logger.error('[CERTIFICATES-STORAGE] Erro ao configurar storage de certificados:', error);
    return false;
  }
};

// Chamar automaticamente ao importar
setupCertificatesStorage();
