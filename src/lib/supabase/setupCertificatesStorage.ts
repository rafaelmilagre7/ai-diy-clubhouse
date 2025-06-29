
import { supabase } from './client';

export const setupCertificatesStorage = async () => {
  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    const certificatesBucketExists = buckets?.some(bucket => bucket.name === 'certificates');
    
    if (!certificatesBucketExists) {
      console.log('Criando bucket certificates...');
      
      const { error: createError } = await supabase.storage.createBucket('certificates', {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        console.error('Erro ao criar bucket certificates:', createError);
        return false;
      }
      
      console.log('Bucket certificates criado com sucesso');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar storage de certificados:', error);
    return false;
  }
};

// Chamar automaticamente ao importar
setupCertificatesStorage();
