
import { supabase } from "@/lib/supabase";
import { VideoFormValues } from "../etapas/types/VideoTypes";

export async function fetchLessonVideos(lessonId: string): Promise<VideoFormValues[]> {
  try {
    const { data, error } = await supabase
      .from("learning_lesson_videos")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });
      
    if (error) {
      console.error("Erro ao buscar vídeos:", error);
      throw error;
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
      fileName: video.video_file_name || undefined,
      filePath: video.video_file_path || undefined,
      fileSize: video.file_size_bytes || undefined,
      duration_seconds: video.duration_seconds || undefined,
      thumbnail_url: video.thumbnail_url || undefined,
      video_id: video.video_id || undefined
    }));
  } catch (error) {
    console.error("Erro ao buscar vídeos da aula:", error);
    return [];
  }
}

export async function saveVideosForLesson(lessonId: string, videos: VideoFormValues[]): Promise<boolean> {
  try {
    console.log("Salvando vídeos para a aula:", lessonId);
    
    if (!videos || videos.length === 0) {
      console.log("Nenhum vídeo para salvar.");
      return true;
    }
    
    // Primeiro, remover todos os vídeos existentes
    const { error: deleteError } = await supabase
      .from('learning_lesson_videos')
      .delete()
      .eq('lesson_id', lessonId);
    
    if (deleteError) {
      console.error("Erro ao remover vídeos existentes:", deleteError);
      return false;
    }
    
    // Para cada vídeo no formulário
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      
      // Se o vídeo não tiver URL, pular
      if (!video.url) {
        console.log("Vídeo sem URL encontrado, pulando...");
        continue;
      }
      
      const videoData = {
        lesson_id: lessonId,
        title: video.title || "Vídeo sem título",
        description: video.description || null,
        url: video.url,
        order_index: i,
        video_type: video.type || "youtube",
        video_file_path: video.video_id || video.filePath || null,
        video_file_name: video.fileName || null,
        file_size_bytes: video.fileSize || null,
        duration_seconds: video.duration_seconds || null,
        thumbnail_url: video.thumbnail_url || null,
        video_id: video.video_id || null
      };
      
      // Inserir novo vídeo
      const { error } = await supabase
        .from('learning_lesson_videos')
        .insert([videoData]);
        
      if (error) {
        console.error(`Erro ao criar vídeo ${i + 1}:`, error);
        return false;
      }
    }
    
    console.log("Todos os vídeos foram salvos com sucesso.");
    return true;
  } catch (error) {
    console.error("Erro ao salvar vídeos:", error);
    return false;
  }
}
