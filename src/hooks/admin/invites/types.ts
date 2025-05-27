export interface Invite {
  id: string;
  email: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
  notes: string | null;
  role?: {
    name: string;
  };
  creator_name?: string;
  creator_email?: string;
  last_sent_at?: string;
  send_attempts?: number;
}

export interface SendInviteResponse {
  success: boolean;
  message: string;
  error?: string;
  emailId?: string;
  strategy?: 'resend_primary' | 'supabase_recovery' | 'supabase_auth';
  method?: 'resend' | 'recovery_link' | 'auth_invite';
  suggestion?: string;
}
