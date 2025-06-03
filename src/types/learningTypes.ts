
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  lesson_id: string;
  parent_id: string | null;
  profiles: {
    id?: string;
    name: string;
    email?: string;
    avatar_url: string;
    role?: string;
  };
  likes_count: number;
  user_has_liked?: boolean;
  replies?: Comment[];
}

// Interface para dados brutos do Supabase (com profiles como array)
export interface RawCommentData {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  lesson_id: string;
  parent_id: string | null;
  likes_count: number;
  profiles: Array<{
    id?: string;
    name: string;
    email?: string;
    avatar_url: string;
    role?: string;
  }>;
}

// Função utilitária para normalizar dados do Supabase
export const normalizeCommentData = (rawData: RawCommentData): Comment => {
  return {
    id: rawData.id,
    content: rawData.content,
    created_at: rawData.created_at,
    user_id: rawData.user_id,
    lesson_id: rawData.lesson_id,
    parent_id: rawData.parent_id,
    likes_count: rawData.likes_count || 0,
    profiles: Array.isArray(rawData.profiles) 
      ? rawData.profiles[0] || { name: 'Usuário', avatar_url: '' }
      : rawData.profiles,
    user_has_liked: false,
    replies: []
  };
};

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  validation_code: string;
  template_id?: string;
  certificate_url?: string;
  has_validation_page?: boolean;
  profiles?: {
    name: string;
    email: string;
  };
  learning_courses?: {
    title: string;
    description?: string;
  };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  html_template: string;
  css_styles?: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  course_id?: string | null;
  metadata?: Record<string, any>;
}
