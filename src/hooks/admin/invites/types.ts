
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

export interface SendInviteResponse {
  success: boolean;
  message: string;
  emailId?: string;
  whatsappId?: string;
  strategy?: 'resend_primary' | 'supabase_recovery' | 'supabase_auth' | 'hybrid';
  method?: string;
  error?: string;
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
}

export interface DiagnosticData {
  timestamp: string;
  systemStatus: 'healthy' | 'warning' | 'critical';
  resendStatus: 'healthy' | 'warning' | 'critical';
  supabaseStatus: 'healthy' | 'warning' | 'critical';
  edgeFunctionStatus: 'healthy' | 'warning' | 'critical';
  configStatus: 'healthy' | 'warning' | 'critical';
  recentAttempts: Array<{
    id: string;
    email: string;
    status: string;
    method_attempted: string;
    created_at: string;
    error_message?: string;
  }>;
  recommendations: string[];
  details: {
    resendApiKey: boolean;
    edgeFunctionVersion: string;
    totalAttempts: number;
    successRate: number;
    lastError?: string;
  };
}

export interface InviteSystemDiagnostic {
  runDiagnostic: () => Promise<DiagnosticData>;
  isRunning: boolean;
  lastDiagnostic: DiagnosticData;
  systemStatus: 'healthy' | 'warning' | 'critical';
  testEmailSend: (email: string) => Promise<SendInviteResponse>;
  recentAttempts: Array<{
    id: string;
    email: string;
    status: string;
    method_attempted: string;
    created_at: string;
    error_message?: string;
  }>;
  isLoading: boolean;
}
