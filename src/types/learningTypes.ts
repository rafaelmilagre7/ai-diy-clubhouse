
export interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  order_index: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: any; // Formato do bloco de conteúdo
  cover_image_url: string | null;
  order_index: number;
  ai_assistant_prompt: string | null;
  ai_assistant_enabled: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  estimated_time_minutes: number;
}

export interface LessonVideo {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  order_index: number;
  created_at: string;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  order_index: number;
  created_at: string;
}

export interface LessonTool {
  id: string;
  lesson_id: string;
  tool_id: string;
  order_index: number;
  created_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  progress_percentage: number;
  last_position_seconds: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningCertificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url: string | null;
  created_at: string;
}
