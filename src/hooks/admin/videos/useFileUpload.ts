
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useFileUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadedVideo, setLastUploadedVideo] = useState<VideoItem | null>(null);

  const handleFileUpload = async (file: File): Promise<VideoItem | null> => {
    if (!solutionId) {
      toast("Erro", {
        description: "É necessário salvar a solução antes de adicionar vídeos."
      });
      return null;
    }

    if (!file.type.startsWith("video/")) {
      toast("Tipo de arquivo inválido", {
        description: "Por favor, selecione apenas arquivos de vídeo."
      });
      return null;
    }

    // Aumentando o limite de 100MB para 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 500MB."
      });
      return null;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `videos/${solutionId}/${fileName}`;

      console.log("[useFileUpload] Iniciando upload do arquivo:", file.name, "tamanho:", file.size);
      console.log("[useFileUpload] Caminho no storage:", filePath);

      // Simulando progresso de upload para feedback visual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Não chega a 100% até que o upload realmente termine
          if (prev < 80) return prev + 5;
          return prev;
        });
      }, 500);
      
      // Verificamos se o bucket existe antes de fazer o upload
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("[useFileUpload] Buckets disponíveis:", buckets?.map(b => b.name));
      
      // Upload para o storage - usando bucket "public" que foi criado no Supabase
      console.log("[useFileUpload] Enviando arquivo para o bucket 'public', caminho:", filePath);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("public")
        .upload(filePath, file, {
          cacheControl: '3600', // Adicionando cache control para evitar problemas de cache
          upsert: true, // Substituir o arquivo se já existir
          contentType: file.type // Definir o tipo MIME do conteúdo corretamente
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error("[useFileUpload] Erro no upload:", uploadError);
        throw uploadError;
      }

      console.log("[useFileUpload] Upload concluído com sucesso:", uploadData);

      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");

      console.log("[useFileUpload] URL pública obtida:", urlData.publicUrl);

      setUploadProgress(100); // Completar progresso ao finalizar

      const videoData = {
        solution_id: solutionId,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        metadata: {
          source: "upload",
          format: fileExt,
          size: file.size,
          description: `Vídeo: ${file.name}`
        }
      };

      console.log("[useFileUpload] Inserindo registro do vídeo no banco de dados:", videoData);

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(videoData)
        .select("*");

      if (error) {
        console.error("[useFileUpload] Erro ao inserir dados no banco:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Banco de dados não retornou os dados após inserção");
      }

      const uploadedVideo = data[0] as VideoItem;
      console.log("[useFileUpload] Vídeo registrado com sucesso no banco:", uploadedVideo);
      
      // Armazenar o vídeo recém-enviado para verificação
      setLastUploadedVideo(uploadedVideo);

      toast("Upload concluído", {
        description: "O vídeo foi adicionado com sucesso."
      });

      return uploadedVideo;
    } catch (error) {
      console.error("[useFileUpload] Erro no upload:", error);
      toast("Erro no upload", {
        description: "Ocorreu um erro ao tentar fazer o upload do vídeo."
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000); // Reset do progresso após um tempo
    }
  };

  return {
    uploading,
    uploadProgress,
    lastUploadedVideo,
    handleFileUpload
  };
};
