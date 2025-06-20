
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
  last_sent_at?: string;
  send_attempts?: number;
}

export interface CreateInviteParams {
  email: string;
  roleId: string;
  notes?: string;
  expiresIn?: string;
}

export interface CreateInviteResult {
  status: 'success' | 'partial_success' | 'error';
  message: string;
  inviteId?: string;
}
