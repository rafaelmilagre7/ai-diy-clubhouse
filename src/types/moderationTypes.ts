
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
  reporter?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  reported_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  topic?: {
    id: string;
    title: string;
  };
  post?: {
    id: string;
    content: string;
  };
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  target_user_id?: string;
  topic_id?: string;
  post_id?: string;
  action_type: 'pin' | 'unpin' | 'lock' | 'unlock' | 'hide' | 'unhide' | 'delete' | 'move' | 'warn' | 'suspend' | 'ban' | 'unban';
  reason: string;
  details?: any;
  duration_hours?: number;
  expires_at?: string;
  created_at: string;
  moderator?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  target_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface UserModerationStatus {
  id: string;
  user_id: string;
  is_suspended: boolean;
  is_banned: boolean;
  suspension_reason?: string;
  ban_reason?: string;
  suspended_until?: string;
  suspended_by?: string;
  banned_by?: string;
  warning_count: number;
  created_at: string;
  updated_at: string;
}

export interface ModerationSettings {
  id: string;
  auto_moderation_enabled: boolean;
  spam_detection_enabled: boolean;
  profanity_filter_enabled: boolean;
  new_user_moderation: boolean;
  max_warnings_before_suspension: number;
  default_suspension_hours: number;
  settings?: any;
  updated_by?: string;
  updated_at: string;
}

export interface ModerationStats {
  total_reports: number;
  pending_reports: number;
  resolved_reports: number;
  total_actions: number;
  active_suspensions: number;
  total_bans: number;
}
