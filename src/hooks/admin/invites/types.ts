
export interface Invite {
  id: string;
  email: string;
  phone?: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
  notes: string | null;
  channel_preference?: 'email' | 'whatsapp' | 'both';
  email_provider?: string;
  email_id?: string;
  role?: {
    name: string;
  };
  creator_name?: string;
  creator_email?: string;
  last_sent_at?: string;
  send_attempts?: number;
}

export interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
  phone?: string;
  channelPreference?: 'email' | 'whatsapp' | 'both';
}

// Interface simples para resultado da criação
export interface CreateInviteResult {
  status: 'success' | 'partial_success' | 'error';
  message: string;
  inviteId?: string;
  emailResult?: {
    success: boolean;
    message: string;
  };
}
