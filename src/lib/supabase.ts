
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';
import { createStoragePublicPolicy } from './supabase/rpc';

// Reexportar todos os tipos necessários
export * from './supabase/types';
export * from './supabase/client';
export * from './supabase/storage';
export * from './supabase/rpc';
export * from './supabase/config';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Funções para trabalhar com vídeos
export async function uploadLearningVideo(file: File, lessonId: string) {
  const filename = `${Date.now()}_${file.name}`;
  const filePath = `${lessonId}/${filename}`;
  
  const { data, error } = await supabase.storage
    .from('learning_videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('learning_videos')
    .getPublicUrl(filePath);
    
  return {
    url: urlData.publicUrl,
    filePath,
    fileName: filename,
    fileSize: file.size
  };
}

export async function createLearningVideoRecord(videoData: {
  lesson_id: string;
  title: string;
  description?: string | null;
  url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  video_file_path?: string | null;
  video_file_name?: string | null;
  file_size_bytes?: number | null;
  order_index?: number;
  video_type?: string;
}) {
  const { data, error } = await supabase
    .from('learning_lesson_videos')
    .insert(videoData)
    .select('*')
    .single();
    
  if (error) throw error;
  return data;
}

// Função para verificar e configurar buckets de armazenamento
export async function setupStorageBuckets() {
  try {
    await createStoragePublicPolicy('learning_videos');
    await createStoragePublicPolicy('solution_files');
    return { success: true };
  } catch (error) {
    console.error("Erro ao configurar buckets:", error);
    return { success: false, error };
  }
}
