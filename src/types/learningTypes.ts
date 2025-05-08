
export interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
  likes_count?: number;
  user_has_liked?: boolean;
  profiles?: {
    name: string;
    avatar_url?: string;
    role?: string;
  };
  replies?: Comment[];
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  html_template: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_default: boolean;
  course_id: string | null;
  metadata: Record<string, any>;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  created_at: string;
  issued_at: string;
  validation_code: string;
  template_id: string | null;
  metadata: Record<string, any>;
  has_validation_page: boolean;
  learning_courses?: {
    id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
  };
  profiles?: {
    name: string | null;
    email: string | null;
  };
}
