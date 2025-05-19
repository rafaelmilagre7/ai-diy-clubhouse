
import { VideoFormValues } from '@/lib/supabase';
import { supabase } from "@/lib/supabase";

export const videoService = {
  async uploadVideo(video: File): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const videoId = 'video-' + Math.random().toString(36).substring(2, 15);
        resolve(videoId);
      }, 1000);
    });
  },

  async getVideoInfo(videoId: string): Promise<VideoFormValues> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (videoId) {
          resolve({
            id: videoId,
            title: 'Video Title',
            description: 'Video Description',
            url: 'https://example.com/video/' + videoId,
            type: 'panda',
            video_id: videoId,
            filePath: '/videos/' + videoId,
            fileSize: 1024,
            duration_seconds: 120,
            thumbnail_url: 'https://example.com/thumbnails/' + videoId + '.jpg',
            embedCode: '<iframe src="https://example.com/embed/' + videoId + '"></iframe>',
            fileName: videoId + '.mp4',
          });
        } else {
          reject('Video not found');
        }
      }, 500);
    });
  },

  async deleteVideo(videoId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Video deleted:', videoId);
        resolve();
      }, 500);
    });
  },
};

// Função para buscar vídeos de uma lição específica
export async function fetchLessonVideos(lessonId: string): Promise<VideoFormValues[]> {
  try {
    // Buscar vídeos da lição do banco de dados
    const { data, error } = await supabase
      .from('learning_lesson_videos')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('position');

    if (error) {
      console.error('Erro ao buscar vídeos:', error);
      return [];
    }

    // Mapear os dados para o formato VideoFormValues
    return data.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description || '',
      type: video.video_type || 'panda',
      url: video.url || '',
      video_id: video.video_id || '',
      filePath: video.file_path || '',
      fileSize: video.file_size || 0,
      duration_seconds: video.duration_seconds || 0,
      thumbnail_url: video.thumbnail_url || '',
      embedCode: video.embed_code || '',
      fileName: video.video_file_name || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar vídeos da aula:', error);
    return [];
  }
}

// Função para salvar vídeos de uma lição
export async function saveVideosForLesson(
  lessonId: string,
  videos: VideoFormValues[]
): Promise<boolean> {
  try {
    // Primeiro remover vídeos existentes
    const { error: deleteError } = await supabase
      .from('learning_lesson_videos')
      .delete()
      .eq('lesson_id', lessonId);

    if (deleteError) {
      console.error('Erro ao remover vídeos antigos:', deleteError);
      return false;
    }

    // Se não houver vídeos para adicionar, retornar sucesso
    if (videos.length === 0) {
      return true;
    }

    // Adicionar os novos vídeos
    const videosToInsert = videos.map((video, index) => ({
      lesson_id: lessonId,
      title: video.title,
      description: video.description || null,
      type: video.type || 'panda',
      url: video.url || null,
      video_id: video.video_id || null,
      file_path: video.filePath || null,
      file_size: video.fileSize || null,
      duration_seconds: video.duration_seconds || null,
      thumbnail_url: video.thumbnail_url || null,
      embed_code: video.embedCode || null,
      file_name: video.fileName || null,
      position: index,
    }));

    const { error: insertError } = await supabase
      .from('learning_lesson_videos')
      .insert(videosToInsert);

    if (insertError) {
      console.error('Erro ao salvar novos vídeos:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar vídeos da aula:', error);
    return false;
  }
}
