
export interface CreateInviteParams {
  email: string;
  roleId: string;
  channels: ('email' | 'whatsapp')[]; // Tornar obrigatório
  whatsappNumber?: string;
  userName?: string; // Campo adicionado para nome da pessoa
  expiresIn?: string;
  notes?: string;
}

export interface InviteCreateResult {
  status: 'success' | 'error';
  message: string;
  invite_id?: string;
  token?: string;
}

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
  whatsapp_number?: string;
  // Campos relacionados ao papel/role
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  user_roles?: {
    id: string;
    name: string;
    description?: string;
  };
  // Campos para os canais de envio (derivados dos deliveries)
  channels?: ('email' | 'whatsapp')[];
}
