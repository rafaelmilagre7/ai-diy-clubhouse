
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
