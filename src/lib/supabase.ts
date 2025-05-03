
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';
import { createStoragePublicPolicy } from './supabase/rpc';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Tipos para o sistema LMS
export interface LearningCourse {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  created_by: string | null;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  course_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string | null;
  content: any | null;
  cover_image_url: string | null;
  module_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  estimated_time_minutes: number | null;
  ai_assistant_enabled: boolean;
  ai_assistant_prompt: string | null;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_position_seconds: number | null;
}

export interface LearningResource {
  id: string;
  lesson_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
  order_index: number;
}

export interface LearningLessonVideo {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  order_index: number;
  video_type: string | null;
  file_size_bytes: number | null;
  video_file_path: string | null;
  video_file_name: string | null;
}

export interface LearningComment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
}

export interface LearningCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  created_at: string;
  issued_at: string;
}

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
  return data as LearningLessonVideo;
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
