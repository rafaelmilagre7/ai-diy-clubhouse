
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Função para upload direto para o Supabase
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  try {
    if (onProgressUpdate) {
      onProgressUpdate(5);
    }
    
    console.log(`Iniciando upload para bucket "${bucketName}", folderPath: "${folderPath}", arquivo: "${file.name}"`);
    
    // Verificar se o bucket existe antes do upload
    console.log("Verificando se o bucket existe:", bucketName);
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("Erro ao listar buckets:", bucketsError);
      throw new Error(`Erro ao verificar buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    console.log(`Bucket ${bucketName} existe? ${bucketExists ? 'Sim' : 'Não'}`);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não encontrado. Tentando criar...`);
      try {
        const result = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600 // 300MB para vídeos, 100MB para outros
        });
        
        if (result.error) {
          console.error("Falha ao criar bucket:", result.error);
          throw new Error(`Não foi possível criar o bucket ${bucketName}: ${result.error.message}`);
        } else {
          console.log(`Bucket ${bucketName} criado com sucesso!`);
        }
      } catch (createError: any) {
        console.error("Erro ao criar bucket:", createError);
        
        // Tentar criar políticas através da função de RPC
        console.log("Tentando configurar políticas públicas para o bucket...");
        try {
          const { data: policyData, error: policyError } = await supabase.rpc(
            'create_storage_public_policy',
            { bucket_name: bucketName }
          );
          
          if (policyError) {
            console.error("Erro ao criar políticas públicas:", policyError);
          } else {
            console.log("Políticas públicas configuradas:", policyData);
          }
        } catch (policyError) {
          console.error("Exceção ao configurar políticas:", policyError);
        }
      }
    }
    
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }
    
    // Gerar um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uuidv4()}_${safeFileName}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Nome do arquivo gerado: ${fileName}`);
    console.log(`Caminho do arquivo para upload: ${filePath}`);
    
    if (onProgressUpdate) {
      onProgressUpdate(20);
    }
    
    // Fazer upload para o Supabase Storage
    console.log("Iniciando upload do arquivo...");
    const uploadResult = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
      
    if (uploadResult.error) {
      console.error("Erro no upload inicial:", uploadResult.error);
      
      // Tentar atualizar as políticas e tentar novamente
      console.log("Tentando atualizar políticas e repetir upload...");
      try {
        const { data: policyData, error: policyError } = await supabase.rpc(
          'create_storage_public_policy',
          { bucket_name: bucketName }
        );
        
        if (policyError) {
          console.error("Erro ao atualizar políticas:", policyError);
        } else {
          console.log("Políticas atualizadas:", policyData);
          
          // Tentar upload novamente
          console.log("Tentando upload novamente...");
          const retryResult = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (retryResult.error) {
            console.error("Upload falhou mesmo após atualizar políticas:", retryResult.error);
            throw retryResult.error;
          } else {
            console.log("Upload bem-sucedido na segunda tentativa!");
            uploadResult.data = retryResult.data;
          }
        }
      } catch (retryError) {
        console.error("Erro ao tentar recuperar upload:", retryError);
        
        // Último recurso: tentar em um bucket alternativo
        const fallbackBucket = "learning_materials";
        if (bucketName !== fallbackBucket) {
          console.log(`Tentando upload em bucket alternativo: ${fallbackBucket}`);
          
          const fallbackResult = await supabase.storage
            .from(fallbackBucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
            
          if (fallbackResult.error) {
            console.error("Upload em bucket alternativo também falhou:", fallbackResult.error);
            throw new Error(`Falha no upload: ${uploadResult.error.message}. Tentativa de fallback também falhou.`);
          } else {
            console.log("Upload bem-sucedido usando bucket alternativo!");
            uploadResult.data = fallbackResult.data;
            bucketName = fallbackBucket; // Atualizar o nome do bucket para obter a URL correta
          }
        } else {
          throw uploadResult.error;
        }
      }
    } else {
      console.log("Upload bem-sucedido!");
    }

    if (onProgressUpdate) {
      onProgressUpdate(80);
    }
    
    // Obter a URL pública do arquivo
    console.log("Obtendo URL pública do arquivo...");
    const urlData = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadResult.data.path);
    
    if (!urlData.data || !urlData.data.publicUrl) {
      console.error("Não foi possível obter URL pública");
      throw new Error("Falha ao obter URL pública do arquivo após upload bem-sucedido");
    }
    
    console.log('URL pública:', urlData.data.publicUrl);
    
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }
    
    return {
      path: uploadResult.data.path,
      publicUrl: urlData.data.publicUrl,
      bucket: bucketName,
      fileName: file.name,
      size: file.size
    };
  } catch (error: any) {
    console.error('Erro completo no upload:', error);
    throw new Error(`Erro no upload: ${error.message || "Erro desconhecido durante o upload"}`);
  }
};
