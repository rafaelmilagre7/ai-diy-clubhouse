
import { supabase } from "@/lib/supabase";

// Função para upload de imagens usando ImgBB API
export const uploadImageToImgBB = async (
  file: File,
  apiKey: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    // Iniciar o progresso em 10%
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }

    // Criar um FormData para enviar para a API do ImgBB
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", apiKey);

    // Simular progresso para 40% quando iniciar o upload
    if (onProgressUpdate) {
      onProgressUpdate(40);
    }

    // Fazer a requisição para a API do ImgBB
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    // Simular progresso para 80% quando a resposta for recebida
    if (onProgressUpdate) {
      onProgressUpdate(80);
    }

    // Se a resposta não for bem-sucedida, lançar um erro
    if (!response.ok) {
      throw new Error(`Erro na API do ImgBB: ${response.status} ${response.statusText}`);
    }

    // Converter a resposta para JSON
    const data = await response.json();

    // Se o upload falhou, lançar um erro com a mensagem da API
    if (!data.success) {
      throw new Error(data.error?.message || "Falha no upload da imagem");
    }

    // Atualizar para 100% após o processamento ser concluído
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }

    // Retornar a URL pública da imagem e o nome do arquivo
    return {
      publicUrl: data.data.url,
      fileName: file.name,
      displayUrl: data.data.display_url,
      thumbnailUrl: data.data.thumb?.url || data.data.url
    };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};

// Mantendo a função original do Supabase para outros tipos de arquivo
export const uploadFileToStorage = async (
  file: File,
  bucketName: string,
  folderPath: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    // Verificar se é uma imagem
    if (file.type.startsWith("image/")) {
      // Para imagens, usar a API do ImgBB
      const apiKey = "04b796a219698057ded57d20ec1705cf";
      return await uploadImageToImgBB(file, apiKey, onProgressUpdate);
    }

    // Para outros tipos de arquivo, continuar com o Supabase
    // Criar um nome de arquivo único baseado no timestamp e nome original
    const timestamp = new Date().getTime();
    const filePath = folderPath 
      ? `${folderPath}/${timestamp}-${file.name}` 
      : `${timestamp}-${file.name}`;

    // Verificar se o bucket existe e criar se necessário
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true
      });
    }

    // Iniciar o progresso em 10%
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }

    // Upload do arquivo usando o client do Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      throw error;
    }

    // Simular progresso para feedback visual
    if (onProgressUpdate) {
      // Atualizar para 80% após o upload ser concluído
      onProgressUpdate(80);
      
      // Simular o processamento final
      setTimeout(() => {
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
      }, 500);
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      publicUrl,
      fileName: file.name
    };
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};
