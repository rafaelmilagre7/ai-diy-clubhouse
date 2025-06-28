
import { supabase } from './client';

// Storage bucket names
export const STORAGE_BUCKETS = {
  LEARNING_VIDEOS: 'learning-videos',
  LEARNING_RESOURCES: 'learning-resources',
  TOOLS_LOGOS: 'tools-logos',
  USER_AVATARS: 'user-avatars',
  GENERAL_UPLOADS: 'general-uploads'
} as const;

/**
 * Get the public URL for a file in storage
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Upload a file to storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { cacheControl?: string; upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false
    });

  if (error) throw error;
  return data;
};

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    // Check if it's already just a video ID
    if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return url;
    }
    
    // Handle different YouTube URL formats
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Format video duration from seconds to readable format
 */
export const formatVideoDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Setup storage buckets and policies - Mock implementation
 */
export const setupStorageBuckets = async () => {
  try {
    console.log('Simulando configuração de buckets de storage');
    
    // Mock implementation since RPC doesn't exist
    return {
      success: true,
      message: 'Storage buckets configurados com sucesso'
    };
  } catch (error) {
    console.error('Erro ao configurar storage buckets:', error);
    throw error;
  }
};

/**
 * Setup learning storage buckets - Mock implementation
 */
export const setupLearningStorageBuckets = async () => {
  try {
    console.log('Simulando configuração de buckets de aprendizado');
    
    // Mock implementation since RPC doesn't exist
    return {
      success: true,
      message: 'Learning storage buckets configurados com sucesso'
    };
  } catch (error) {
    console.error('Erro ao configurar learning storage buckets:', error);
    throw error;
  }
};

/**
 * Ensure bucket exists - Mock implementation
 */
export const ensureBucketExists = async (bucketName: string) => {
  console.log(`Simulando verificação de bucket: ${bucketName}`);
  return { success: true };
};

/**
 * Extract Panda video info from URL - FIXED to include embedUrl
 */
export const extractPandaVideoInfo = (url: string) => {
  if (!url) return null;
  
  try {
    // Check for embed URL pattern
    const embedMatch = url.match(/embed\/\?v=([^&]+)/);
    if (embedMatch && embedMatch[1]) {
      const videoId = embedMatch[1];
      return { 
        videoId, 
        embedUrl: url // Return the full embed URL
      };
    }
    
    // Check for iframe pattern and extract embed URL
    const iframeMatch = url.match(/src="([^"]+)"/);
    if (iframeMatch && iframeMatch[1]) {
      const embedUrl = iframeMatch[1];
      const videoIdMatch = embedUrl.match(/embed\/\?v=([^&]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        return { 
          videoId: videoIdMatch[1], 
          embedUrl 
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Panda video info:', error);
    return null;
  }
};

/**
 * Upload file with fallback options
 */
export const uploadFileWithFallback = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { cacheControl?: string; upsert?: boolean }
) => {
  try {
    return await uploadFile(bucket, path, file, options);
  } catch (error) {
    console.error('Primary upload failed, trying fallback:', error);
    // Fallback logic could be implemented here
    throw error;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (bucket: string, paths: string[]) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) throw error;
  return data;
};

/**
 * List files in a storage bucket
 */
export const listFiles = async (bucket: string, path?: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) throw error;
  return data;
};
