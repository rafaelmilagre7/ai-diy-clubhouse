export interface Invite {
  id: string;
  email: string;
  whatsapp_number?: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
  notes: string | null;
  preferred_channel?: 'email' | 'whatsapp' | 'both';
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

export interface SendInviteResponse {
  success: boolean;
  message: string;
  error?: string;
  emailId?: string;
  whatsappId?: string;
  strategy?: string;
  method?: string;
  suggestion?: string;
  channel?: 'email' | 'whatsapp' | 'both';
}

export interface CreateInviteResponse {
  invite_id: string;
  token: string;
  expires_at: string;
  status: 'success' | 'error';
  message?: string;
  channel_used?: 'email' | 'whatsapp' | 'both';
}

export interface WhatsAppInviteData {
  phone: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  email?: string;
}
