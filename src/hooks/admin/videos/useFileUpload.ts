
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { VideoItem } from "@/types/videoTypes";

export const useFileUpload = (solutionId: string) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadedVideo, setLastUploadedVideo] = useState<VideoItem | null>(null);
  const uploadInProgressRef = useRef(false);

  const handleFileUpload = async (file: File): Promise<VideoItem | null> => {
    if (!solutionId) {
      toast("Erro", {
        description: "É necessário salvar a solução antes de adicionar vídeos."
      });
      return null;
    }

    if (uploadInProgressRef.current) {
      toast("Upload em andamento", {
        description: "Aguarde o término do upload atual."
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
      uploadInProgressRef.current = true;
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}-${Date.now()}.${fileExt}`;
      const filePath = `videos/${solutionId}/${fileName}`;

      console.log("[useFileUpload] Iniciando upload do arquivo:", file.name, "tamanho:", file.size);
      console.log("[useFileUpload] Caminho no storage:", filePath);

      // Atualizar o progresso a cada 1 segundo para feedback visual
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 85) return prev + 2;
          return prev;
        });
      }, 1000);
      
      // Verificar se o bucket public existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'public');
      
      console.log("[useFileUpload] Bucket 'public' existe:", bucketExists);
      
      if (!bucketExists) {
        // Se não existir, tentamos criar
        console.log("[useFileUpload] Tentando criar bucket 'public'...");
        try {
          const { data, error } = await supabase.storage.createBucket('public', {
            public: true,
            fileSizeLimit: 524288000 // 500MB em bytes
          });
          
          if (error) {
            console.error("[useFileUpload] Erro ao criar bucket:", error);
            throw new Error("Não foi possível criar o bucket de armazenamento.");
          }
          console.log("[useFileUpload] Bucket criado com sucesso:", data);
        } catch (err) {
          console.error("[useFileUpload] Erro ao tentar criar bucket:", err);
          throw new Error("Ocorreu um erro ao configurar o armazenamento.");
        }
      } else {
        // Se o bucket já existe, vamos verificar se está com acesso público
        try {
          console.log("[useFileUpload] Bucket 'public' já existe, verificando configurações...");
          // Atualizar para garantir que esteja público e com o limite correto
          const { error } = await supabase.storage.updateBucket('public', {
            public: true,
            fileSizeLimit: 524288000 // 500MB em bytes
          });
          
          if (error) {
            console.warn("[useFileUpload] Aviso ao atualizar bucket:", error);
          }
        } catch (err) {
          console.warn("[useFileUpload] Aviso ao verificar bucket:", err);
        }
      }
      
      console.log("[useFileUpload] Enviando arquivo para o storage...");
      
      // Upload para o storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("public")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error("[useFileUpload] Erro no upload:", uploadError);
        throw uploadError;
      }

      console.log("[useFileUpload] Upload concluído com sucesso:", uploadData);
      setUploadProgress(90);

      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Não foi possível obter a URL do vídeo");

      console.log("[useFileUpload] URL pública obtida:", urlData.publicUrl);
      setUploadProgress(95);

      // Criar registro do vídeo no banco de dados
      const videoData = {
        solution_id: solutionId,
        name: file.name,
        type: "video",
        url: urlData.publicUrl,
        metadata: {
          source: "upload",
          format: fileExt,
          size: file.size,
          description: `Vídeo: ${file.name}`,
          uploaded_at: new Date().toISOString()
        }
      };

      console.log("[useFileUpload] Inserindo registro do vídeo no banco de dados:", videoData);

      const { data, error } = await supabase
        .from("solution_resources")
        .insert(videoData)
        .select("*")
        .single();

      if (error) {
        console.error("[useFileUpload] Erro ao inserir dados no banco:", error);
        throw error;
      }

      console.log("[useFileUpload] Vídeo registrado com sucesso no banco:", data);
      setUploadProgress(100);
      
      // Armazenar o vídeo recém-enviado
      setLastUploadedVideo(data as VideoItem);

      toast("Upload concluído", {
        description: "O vídeo foi adicionado com sucesso."
      });

      return data as VideoItem;
    } catch (error: any) {
      console.error("[useFileUpload] Erro no upload:", error);
      toast("Erro no upload", {
        description: error.message || "Ocorreu um erro ao tentar fazer o upload do vídeo."
      });
      return null;
    } finally {
      uploadInProgressRef.current = false;
      setUploading(false);
      // Resetar o progresso após 2 segundos para uma melhor experiência do usuário
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return {
    uploading,
    uploadProgress,
    lastUploadedVideo,
    handleFileUpload
  };
};
