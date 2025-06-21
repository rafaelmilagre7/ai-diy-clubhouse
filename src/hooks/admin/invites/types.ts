
export interface Invite {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
  used_at?: string;
  role_id: string;
  role?: {
    name: string;
  };
  notes?: string;
  preferred_channel?: 'email' | 'whatsapp' | 'both';
}

export interface CreateInviteParams {
  email: string;
  roleId: string;
  expiresIn?: string;
  notes?: string;
  channels?: ('email' | 'whatsapp')[];
  whatsappNumber?: string;
  userName?: string; // Novo campo obrigatório para WhatsApp
}

export interface InviteCreateResult {
  status: 'success' | 'error';
  message: string;
  invite_id?: string;
  token?: string;
}

export interface ResendInviteParams {
  inviteId: string;
  email: string;
  roleId: string;
  token: string;
  channels?: ('email' | 'whatsapp')[];
  whatsappNumber?: string;
  userName?: string; // Novo campo para reenvio via WhatsApp
  notes?: string;
}
