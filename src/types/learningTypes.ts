export interface Certificate {
  id: string;
  user_id: string;
  course_id?: string;
  solution_id?: string;
  certificate_url: string | null;
  validation_code: string;
  has_validation_page?: boolean;
  issued_at: string;
  implementation_date?: string;
  template_id?: string;
  created_at: string;
}

export interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  implementation_date: string;
  certificate_url: string | null;
  validation_code: string;
  template_id: string | null;
  issued_at: string;
  created_at: string;
  updated_at: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  html_template: string;
  css_styles: string | null;
  is_active: boolean;
  is_default?: boolean;
  course_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  is_hidden: boolean;
  user_has_liked?: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string;
  } | null;
  replies?: Comment[];
}

export interface LearningCourseFormData {
  title: string;
  description?: string;
  cover_image_url?: string;
  published: boolean;
  video_lessons?: VideoLesson[];
}

export interface VideoLesson {
  id: string;
  title: string;
  url: string;
  description?: string;
  duration?: number;
  order_index: number;
  thumbnail_url?: string;
}
