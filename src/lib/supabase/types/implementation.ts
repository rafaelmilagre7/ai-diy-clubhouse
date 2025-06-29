
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
