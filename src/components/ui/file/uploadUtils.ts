
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Função para upload direto para o Supabase
export const uploadFileToSupabase = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    // Verificar se o bucket existe antes do upload
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não encontrado. Tentando criar...`);
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }
    
    // Gerar um nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Iniciando upload para bucket "${bucketName}", caminho "${filePath}"`);
    
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Erro no upload para o Supabase:', error);
      throw error;
    }
    
    console.log('Upload realizado com sucesso:', data?.path);
    
    if (onProgressUpdate) {
      onProgressUpdate(80);
    }
    
    // Obter a URL pública do arquivo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }
    
    return {
      publicUrl: urlData.publicUrl,
      fileName: file.name,
      filePath: data?.path || filePath
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

// Função para fazer upload de imagem para ImgBB
export const uploadImageToImgBB = async (
  file: File,
  apiKey: string = '04b796a219698057ded57d20ec1705cf',
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.imgbb.com/1/upload?key=${apiKey}`, true);
    
    // Monitorar progresso, se necessário
    if (onProgressUpdate) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgressUpdate(progress);
        }
      };
    }
    
    // Criar Promise para manipular a resposta
    return new Promise<{ publicUrl: string; fileName: string }>((resolve, reject) => {
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve({
                publicUrl: response.data.url,
                fileName: file.name
              });
            } else {
              reject(new Error('Erro no upload para ImgBB: ' + response.error?.message || 'Erro desconhecido'));
            }
          } catch (error) {
            reject(new Error('Erro ao processar resposta do ImgBB'));
          }
        } else {
          reject(new Error('Erro no upload para ImgBB. Status: ' + xhr.status));
        }
      };
      
      xhr.onerror = () => reject(new Error('Erro de rede ao fazer upload para ImgBB'));
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Erro no upload para ImgBB:', error);
    throw error;
  }
};

// Função para determinar se um arquivo é uma imagem
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

// Função principal que decide onde fazer upload com base no tipo de arquivo
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    console.log(`Tentando upload para ${bucketName}/${folderPath}`, file);
    
    // Primeiro tentar o upload para o Supabase
    try {
      return await uploadFileToSupabase(file, bucketName, folderPath, onProgressUpdate);
    } catch (supabaseError) {
      console.error("Erro no upload para Supabase, tentando ImgBB como fallback:", supabaseError);
      
      // Se o arquivo for uma imagem e houver falha no Supabase, tentar ImgBB como fallback
      if (isImageFile(file)) {
        return await uploadImageToImgBB(file, undefined, onProgressUpdate);
      } else {
        // Se não for imagem, não podemos usar ImgBB, então relançamos o erro
        throw supabaseError;
      }
    }
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};

// Importar as funções necessárias do arquivo fileTypes
import { 
  isImageFile as detectFileType,
  getFileIcon, 
  getFileFormatName 
} from './utils/fileTypes';

// Exportar para uso externo
export { detectFileType, getFileIcon, getFileFormatName };
