
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

// Função para upload direto para o Supabase
export const uploadFileToSupabase = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  try {
    // Verificar se o bucket existe antes do upload
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não encontrado. Tentando criar...`);
      const result = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600 // 300MB para vídeos, 100MB para outros
      });
      
      if (result.error) {
        console.error("Falha ao criar bucket:", result.error);
        throw new Error(`Não foi possível criar o bucket ${bucketName}: ${result.error.message}`);
      }
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
        duplex: "half", // Melhor suporte para uploads grandes
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
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
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
    
    // Configurar cancelamento
    if (abortSignal) {
      abortSignal.onabort = () => xhr.abort();
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
  onProgressUpdate?: (progress: number) => void,
  abortSignal?: AbortSignal
) => {
  try {
    console.log(`Tentando upload para ${bucketName}/${folderPath}`, file);
    
    // Determinar bucket de fallback apropriado
    let fallbackBucket = 'solution_files';
    
    if (bucketName === 'learning_resources' && !isImageFile(file)) {
      fallbackBucket = 'solution_files';
    } else if (bucketName.includes('video') && file.type.startsWith('video/')) {
      fallbackBucket = 'learning_videos';
    }
    
    // Primeiro tentar o upload para o Supabase no bucket solicitado
    try {
      return await uploadFileToSupabase(file, bucketName, folderPath, onProgressUpdate, abortSignal);
    } catch (supabaseError) {
      console.error(`Erro no upload para ${bucketName}, tentando fallback para ${fallbackBucket}:`, supabaseError);
      
      // Se o arquivo for uma imagem e houver falha no Supabase, tentar ImgBB como fallback
      if (isImageFile(file)) {
        console.log("Tentando fallback para ImgBB (imagem)");
        return await uploadImageToImgBB(file, undefined, onProgressUpdate, abortSignal);
      } else {
        // Se não for imagem, tentamos outro bucket no Supabase como fallback
        console.log(`Tentando fallback para bucket ${fallbackBucket}`);
        const fallbackFolder = folderPath ? `${bucketName}/${folderPath}` : bucketName;
        return await uploadFileToSupabase(file, fallbackBucket, fallbackFolder, onProgressUpdate, abortSignal);
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
