
import { supabase } from './client';

export const getYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const setupLearningStorageBuckets = async () => {
  try {
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    throw error;
  }
};

export const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    throw error;
  }
};

export const extractPandaVideoInfo = (url: string) => {
  // Implementação para extrair informações de vídeo do Panda
  return {
    videoId: url,
    thumbnailUrl: '',
    duration: 0,
    url: url // Adicionando a propriedade url que estava faltando
  };
};

export const uploadFileWithFallback = async (
  file: File,
  path: string,
  bucket: string = 'learning_materials'
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
