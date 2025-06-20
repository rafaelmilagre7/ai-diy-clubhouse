
// Tipos simplificados para o sistema de convites 100% simples
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
}

export interface InviteCreateResult {
  status: 'success' | 'error';
  message: string;
  invite_id?: string;
  token?: string;
}
