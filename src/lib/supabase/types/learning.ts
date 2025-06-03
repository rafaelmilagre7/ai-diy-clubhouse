
// Tipos específicos do sistema de aprendizado (LMS)
import type { UserProfile } from './core';

// === BASE LEARNING TYPES ===
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
  is_restricted?: boolean;
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
  learning_courses?: LearningCourse | null;
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
  ai_assistant_id: string | null;
  difficulty_level?: string | null;
  videos?: LearningLessonVideo[];
  resources?: LearningResource[];
  module?: LearningModule & {
    course_id?: string;
    learning_courses?: LearningCourse;
  };
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
  video_progress: Record<string, number>;
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
  video_type?: string;
  file_size_bytes?: number | null;
  video_file_path?: string | null;
  video_file_name?: string | null;
  video_id?: string | null;
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

export interface LearningLessonNps {
  id: string;
  user_id: string;
  lesson_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

// === EXTENDED TYPES COM PROPRIEDADES COMPUTADAS ===
export interface LearningCourseWithStats extends LearningCourse {
  module_count?: number;
  lesson_count?: number;
  all_lessons?: LearningLesson[];
  progress?: number;
  is_restricted?: boolean;
}

export interface LearningModuleWithStats extends LearningModule {
  lesson_count?: number;
  lessons?: LearningLesson[];
  progress?: number;
}

// === FORM TYPES ===
export interface VideoFormValues {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  video_id?: string;
  thumbnail_url?: string;
  order_index?: number;
}
