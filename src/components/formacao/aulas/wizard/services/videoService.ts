// Atualizar a importação para usar o caminho correto
import { VideoFormValues } from '@/lib/supabase';

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
            type: 'mp4',
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
