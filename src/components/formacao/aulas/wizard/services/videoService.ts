
import { supabase } from "@/lib/supabase";
import { VideoFormValues } from "../etapas/types/VideoTypes";

export const fetchLessonVideos = async (lessonId: string): Promise<VideoFormValues[]> => {
  try {
    const { data, error } = await supabase
      .from("learning_lesson_videos")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
        
    if (error) {
      console.error("Erro ao buscar vídeos da aula:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description || "",
      url: video.url,
      type: video.video_type || "youtube",
      fileName: video.video_file_name,
      filePath: video.video_file_path,
      fileSize: video.file_size_bytes,
      duration_seconds: video.duration_seconds,
      thumbnail_url: video.thumbnail_url,
      video_id: video.video_id
    }));
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return [];
  }
};

export const saveVideos = async (lessonId: string, videos: VideoFormValues[]): Promise<{ success: boolean, message: string }> => {
  try {
    console.log("Salvando vídeos para a aula:", lessonId);
    
    if (!videos || videos.length === 0) {
      console.log("Nenhum vídeo para salvar.");
      return { success: true, message: "Nenhum vídeo para salvar" };
    }
    
    let videosSalvosComSucesso = 0;
    let errosEncontrados = 0;
    
    // Primeiro removemos todos os vídeos existentes desta aula
    console.log("Removendo vídeos existentes...");
    const { error: deleteError } = await supabase
      .from('learning_lesson_videos')
      .delete()
      .eq('lesson_id', lessonId);
        
    if (deleteError) {
      console.error("Erro ao remover vídeos existentes:", deleteError);
      return { 
        success: false, 
        message: `Erro ao remover vídeos existentes: ${deleteError.message}`
      };
    }
    
    // Para cada vídeo no formulário
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      
      // Se o vídeo não tiver URL, pular
      if (!video.url) {
        console.log(`Vídeo ${i + 1} sem URL encontrado, pulando...`);
        continue;
      }
      
      try {
        const videoData = {
          lesson_id: lessonId,
          title: video.title || "Vídeo sem título",
          description: video.description || null,
          url: video.url,
          order_index: i,
          video_type: video.type || "youtube",
          video_file_path: video.filePath || null,
          video_file_name: video.fileName || null,
          file_size_bytes: video.fileSize || null,
          duration_seconds: video.duration_seconds || null,
          thumbnail_url: video.thumbnail_url || null,
          video_id: video.video_id
        };
        
        console.log(`Salvando vídeo ${i + 1}:`, videoData);
        
        // Sempre inserir novos registros após a limpeza
        const { error } = await supabase
          .from('learning_lesson_videos')
          .insert([videoData]);
          
        if (error) {
          console.error(`Erro ao criar vídeo ${i + 1}:`, error);
          errosEncontrados++;
          continue;
        }
        
        console.log(`Vídeo ${i + 1} criado com sucesso.`);
        videosSalvosComSucesso++;
      } catch (err) {
        console.error(`Erro ao processar vídeo ${i + 1}:`, err);
        errosEncontrados++;
      }
    }
    
    // Mostrar mensagem de resumo
    if (errosEncontrados > 0) {
      if (videosSalvosComSucesso > 0) {
        const mensagem = `Alguns vídeos não puderam ser salvos. Salvos: ${videosSalvosComSucesso}, Erros: ${errosEncontrados}`;
        console.warn(mensagem);
        return { success: true, message: mensagem };
      } else {
        console.error("Nenhum vídeo pôde ser salvo.");
        return { 
          success: false, 
          message: "Não foi possível salvar os vídeos. Verifique os logs para mais detalhes."
        };
      }
    } else if (videosSalvosComSucesso > 0) {
      console.log(`Todos os ${videosSalvosComSucesso} vídeos foram salvos com sucesso.`);
    }
    
    return { 
      success: true, 
      message: videosSalvosComSucesso > 0 ? 
        `${videosSalvosComSucesso} vídeo(s) salvo(s) com sucesso.` : 
        "Nenhum vídeo para salvar."
    };
  } catch (error: any) {
    console.error("Erro ao salvar vídeos:", error);
    return { 
      success: false, 
      message: `Erro ao salvar vídeos: ${error.message || "Erro desconhecido"}`
    };
  }
};

export const calculateTotalDuration = (videos: VideoFormValues[]): number => {
  if (!videos || videos.length === 0) return 0;
  
  let totalDuration = 0;
  for (const video of videos) {
    if (video.duration_seconds) {
      totalDuration += video.duration_seconds;
    }
  }
  
  // Converter segundos para minutos e arredondar para cima
  return Math.ceil(totalDuration / 60);
};
