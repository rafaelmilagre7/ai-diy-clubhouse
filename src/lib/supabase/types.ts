
import { Database } from './types/database.types';

// Tipos para o sistema de referrals/indicações
export type ReferralType = 'club' | 'formacao';
export type ReferralStatus = 'pending' | 'registered' | 'completed';

export type Referral = {
  id: string;
  referrer_id: string;
  email: string;
  token: string;
  type: ReferralType;
  status: ReferralStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  expires_at: string;
  benefits_claimed: boolean;
  metadata?: Record<string, any>;
  notes?: string;
  role_id?: string;
  whatsapp_number?: string;
  last_sent_at?: string;
  send_attempts?: number;
};

export type ReferralFormData = {
  email: string;
  type: ReferralType;
  notes?: string;
};

export type ReferralStats = {
  total: number;
  pending: number;
  completed: number;
  conversion_rate: number;
};

// Re-exportando o tipo Database para manter compatibilidade
export type { Database };
