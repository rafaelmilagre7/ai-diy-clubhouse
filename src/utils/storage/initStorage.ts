
import { supabase } from '@/integrations/supabase/client';

export const initializeBrandAssetsBucket = async () => {
  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.id === 'brand-assets');
    
    if (!bucketExists) {
      // Criar bucket se não existir
      const { error: createError } = await supabase.storage.createBucket('brand-assets', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Erro ao criar bucket brand-assets:', createError);
      } else {
        console.log('Bucket brand-assets criado com sucesso');
      }
    }
  } catch (error) {
    console.error('Erro na inicialização do storage:', error);
  }
};
