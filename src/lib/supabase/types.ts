export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  industry?: string | null;
  company_name?: string | null;
}

export type UserRole = 'admin' | 'member' | 'formacao';

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
  author_id?: string;
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

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  completion_data?: any;
  last_activity: string;
  completed_at?: string | null;
  created_at: string;
  implementation_status?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location_link: string | null;
  physical_location: string | null;
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface ImplementationCheckpoint {
  id: string;
  solution_id: string | null;
  description: string;
  checkpoint_order: number;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  official_url: string;
  category: string;
  logo_url: string | null;
  video_url: string | null;
  video_type: string | null;
  tags: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
  has_member_benefit: boolean;
  benefit_title: string | null;
  benefit_description: string | null;
  benefit_link: string | null;
  benefit_badge_url: string | null;
  benefit_type: string | null;
  benefit_clicks: number;
  video_tutorials: any[];
}

export interface SolutionTool {
  id: string;
  solution_id: string | null;
  tool_name: string;
  tool_url: string | null;
  is_required: boolean;
  created_at: string;
  details?: Tool | null;
}

export interface SolutionResource {
  id: string;
  format: string | null;
  url: string;
  name: string;
  type: string;
  solution_id: string | null;
  module_id: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
  metadata: any | null;
}
