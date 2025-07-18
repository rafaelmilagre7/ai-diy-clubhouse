import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

/**
 * Hook seguro para operações de storage do Supabase que evita erros RLS
 */
export const useSupabaseStorage = () => {
  const ensureBucketSafely = useCallback(async (bucketName: string) => {
    try {
      // Primeira tentativa: verificar se bucket existe sem listar (evita RLS)
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket(bucketName);

      if (bucketData) {
        logger.info(`[SUPABASE-STORAGE] Bucket '${bucketName}' já existe`);
        return true;
      }

      // Se não existe, tentar criar
      if (bucketError?.message?.includes('not found')) {
        const { data: createData, error: createError } = await supabase.storage
          .createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/*', 'application/pdf']
          });

        if (createError) {
          if (createError.message.includes('already exists')) {
            logger.info(`[SUPABASE-STORAGE] Bucket '${bucketName}' já existe (detectado na criação)`);
            return true;
          }
          logger.warn(`[SUPABASE-STORAGE] Erro ao criar bucket '${bucketName}':`, createError);
          return false;
        }

        logger.info(`[SUPABASE-STORAGE] Bucket '${bucketName}' criado com sucesso`);
        return true;
      }

      logger.warn(`[SUPABASE-STORAGE] Erro inesperado ao verificar bucket:`, bucketError);
      return false;

    } catch (error) {
      logger.error(`[SUPABASE-STORAGE] Erro crítico no gerenciamento de bucket:`, error);
      return false;
    }
  }, []);

  const uploadFileSecurely = useCallback(async (
    bucketName: string,
    filePath: string,
    file: File | Blob,
    options?: { upsert?: boolean }
  ) => {
    try {
      // Garantir que o bucket existe
      const bucketReady = await ensureBucketSafely(bucketName);
      if (!bucketReady) {
        throw new Error(`Bucket '${bucketName}' não está disponível`);
      }

      // Fazer upload do arquivo
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: options?.upsert ?? true
        });

      if (error) {
        throw error;
      }

      logger.info(`[SUPABASE-STORAGE] Upload concluído: ${filePath}`);
      return data;

    } catch (error) {
      logger.error(`[SUPABASE-STORAGE] Erro no upload:`, error);
      throw error;
    }
  }, [ensureBucketSafely]);

  const getPublicUrl = useCallback((bucketName: string, filePath: string) => {
    try {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      logger.error(`[SUPABASE-STORAGE] Erro ao obter URL pública:`, error);
      return null;
    }
  }, []);

  return {
    ensureBucketSafely,
    uploadFileSecurely,
    getPublicUrl
  };
};