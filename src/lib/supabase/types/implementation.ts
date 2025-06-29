
// Tipos para o sistema de Implementation Trails
export interface ImplementationTrail {
  id: string;
  user_id: string;
  trail_data: any;
  status: 'draft' | 'active' | 'completed' | 'paused';
  generation_attempts: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  topic_id?: string;
  post_id?: string;
  report_type: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para certificados de soluções
export interface SolutionCertificate {
  id: string;
  user_id: string;
  solution_id: string;
  template_id?: string;
  validation_code: string;
  implementation_date: string;
  certificate_url?: string;
  certificate_filename?: string;
  issued_at: string;
  created_at: string;
  updated_at: string;
  solutions?: {
    title: string;
    category: string;
    description?: string;
  };
}

export interface SolutionCertificateTemplate {
  id: string;
  name: string;
  html_template: string;
  css_styles?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
