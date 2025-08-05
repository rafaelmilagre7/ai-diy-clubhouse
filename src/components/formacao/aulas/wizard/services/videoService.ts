
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
    console.log("🎥 VideoService - Salvando vídeos para a aula:", lessonId);
    console.log("🎥 VideoService - Vídeos recebidos:", videos);
    
    if (!videos || videos.length === 0) {
      console.log("🎥 VideoService - Nenhum vídeo para salvar.");
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
      
      // Validações obrigatórias para salvamento
      if (!video.url) {
        console.log("🎥 VideoService - Vídeo sem URL encontrado, pulando:", video);
        continue;
      }
      
      if (!video.title || video.title.trim() === "") {
        console.log("🎥 VideoService - Vídeo sem título encontrado, pulando:", video);
        continue;
      }
      
      // CORREÇÃO: Validação mais flexível para Panda Video
      // Se é tipo panda, precisa ter video_id OU poder extrair do URL
      if (video.type === "panda") {
        const hasVideoId = video.video_id && video.video_id.trim() !== "";
        const hasValidUrl = video.url && (video.url.includes('pandavideo') || video.url.includes('player-vz'));
        
        if (!hasVideoId && !hasValidUrl) {
          console.log("🎥 VideoService - Vídeo Panda sem identificação válida, pulando:", video);
          continue;
        }
        
        // Se não tem video_id mas tem URL válida, tentar extrair
        if (!hasVideoId && hasValidUrl) {
          const extractedId = video.url.match(/[?&]v=([a-f0-9\-]{36})/i) || 
                              video.url.match(/\/embed\/([a-f0-9\-]{36})/i) ||
                              video.url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
          
          if (extractedId && extractedId[1]) {
            video.video_id = extractedId[1];
            console.log("🎥 VideoService - Video ID extraído da URL:", video.video_id);
          }
        }
      }
      
      console.log(`🎥 VideoService - Processando vídeo ${i + 1}:`, video);
      
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
