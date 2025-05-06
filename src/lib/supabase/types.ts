
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  industry?: string | null;
  company_name?: string | null;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail_url: string | null;
  category: 'productivity' | 'marketing' | 'leadership' | 'finance' | 'communication' | 'operations' | 'sales' | 'customer_service' | 'human_resources' | 'revenue' | 'operational' | 'strategy';
  difficulty: 'easy' | 'medium' | 'advanced' | 'expert';
  published: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
  estimated_time: number | null;
  success_rate: number;
  checklist_items: any[];
  implementation_steps: any[];
  completion_requirements: any;
  related_solutions: string[];
  videos?: any[];
  overview?: string;
  checklist?: any[];
}

export interface Module {
  id: string;
  title: string;
  type: string; 
  content: any;
  metrics: any;
  solution_id: string;
  created_at: string;
  updated_at: string;
  module_order: number;
  estimated_time_minutes?: number;
  certificate_template?: any;
}

export interface LearningCourse {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  order_index: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  published: boolean;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string | null;
  module_id: string;
  cover_image_url: string | null;
  ai_assistant_enabled: boolean;
  ai_assistant_prompt: string | null;
  published: boolean;
  order_index: number;
  estimated_time_minutes: number | null;
  created_at: string;
  updated_at: string;
  content: any | null;
  difficulty_level?: string;
}

export interface LearningLessonVideo {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  url: string;
  order_index: number;
  video_type: string | null;
  video_file_path: string | null;
  video_file_name: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  video_id: string | null;
  created_at: string;
}

export interface LearningResource {
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

export interface LearningProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at: string | null;
  progress_percentage: number;
  last_position_seconds: number | null;
  notes: string | null;
  video_progress: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface LearningComment {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
