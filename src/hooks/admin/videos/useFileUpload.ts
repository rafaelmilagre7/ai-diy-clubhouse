
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useFileUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
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
      const filePath = `solution_videos/${solutionId}/${fileName}`;

      console.log("Iniciando upload do arquivo:", file.name, "tamanho:", file.size);

      // Simulando progresso de upload para feedback visual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Não chega a 100% até que o upload realmente termine
          if (prev < 80) return prev + 5;
          return prev;
        });
      }, 500);

      // Verificamos primeiro se o bucket existe, se não, tentamos criá-lo
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === "videos");
      
      if (!bucketExists) {
        console.log("Bucket 'videos' não encontrado, usando bucket padrão 'resources'");
      }
      
      // Usamos o bucket 'resources' que é um bucket padrão no Supabase
      console.log("Enviando arquivo para o bucket 'resources', caminho:", filePath);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("resources")
        .upload(filePath, file, {
          cacheControl: '3600', // Adicionando cache control para evitar problemas de cache
          upsert: true // Substituir o arquivo se já existir
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error("Erro no upload:", uploadError);
        throw uploadError;
      }

      console.log("Upload concluído com sucesso:", uploadData);

      const { data: urlData } = supabase.storage
        .from("resources")
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");

      console.log("URL pública obtida:", urlData.publicUrl);

      setUploadProgress(100); // Completar progresso ao finalizar

      const newVideo = {
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

      console.log("Inserindo registro do vídeo no banco de dados:", newVideo);

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(newVideo)
        .select();

      if (error) {
        console.error("Erro ao inserir dados no banco:", error);
        throw error;
      }

      console.log("Vídeo registrado com sucesso no banco:", data);

      toast("Upload concluído", {
        description: "O vídeo foi adicionado com sucesso."
      });

      return data[0] as VideoItem;
    } catch (error) {
      console.error("Erro no upload:", error);
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
    handleFileUpload,
    setUploadProgress
  };
};
