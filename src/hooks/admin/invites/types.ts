
// Tipos para o sistema de convites com comunicação multicanal
export interface Invite {
  id: string;
  email: string;
  role_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  created_by: string;
  last_sent_at: string | null;
  send_attempts: number;
  notes: string | null;
  whatsapp_number?: string | null;
  preferred_channel?: 'email' | 'whatsapp' | 'both';
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
  whatsappNumber?: string;
  channels?: ('email' | 'whatsapp')[];
}

export interface InviteCreateResult {
  status: 'success' | 'error';
  message: string;
  invite_id?: string;
  token?: string;
}

export interface InviteDelivery {
  id: string;
  invite_id: string;
  channel: 'email' | 'whatsapp';
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  provider_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommunicationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number?: string;
  preferred_channel: 'email' | 'whatsapp' | 'both';
  created_at: string;
  updated_at: string;
}
