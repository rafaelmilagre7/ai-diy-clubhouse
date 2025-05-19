
import { VideoFormValues } from '@/lib/supabase';

// Re-exportar o tipo do local centralizado
export type { VideoFormValues };

// Tipos adicionais específicos para o componente de vídeo, se necessário
export interface VideoItemProps {
  video: VideoFormValues;
  index: number;
  onRemove: () => void;
  onChange: (field: string, value: any) => void;
  onEmbedChange: (embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
}

export interface VideoListProps {
  videos: VideoFormValues[];
  onVideoChange: (index: number, field: string, value: any) => void;
  onVideoRemove: (index: number) => void;
  onEmbedChange: (index: number, embedCode: string, videoId: string, url: string, thumbnailUrl: string) => void;
  onDragEnd: (result: any) => void;
}
