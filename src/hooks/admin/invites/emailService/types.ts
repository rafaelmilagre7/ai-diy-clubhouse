
export interface SendInviteEmailParams {
  email: string;
  inviteUrl: string;
  roleName: string;
  expiresAt: string;
  senderName?: string;
  notes?: string;
  inviteId?: string;
  retryCount?: number;
}

export interface EmailQueueItem extends SendInviteEmailParams {
  timestamp: number;
}

export interface InviteEmailServiceReturn {
  sendInviteEmail: (params: SendInviteEmailParams) => Promise<SendInviteResponse>;
  getInviteLink: (token: string) => string;
  isSending: boolean;
  sendError: Error | null;
  pendingEmails: number;
  retryAllPendingEmails: () => void;
  clearEmailQueue: () => void;
}

export interface SendInviteResponse {
  success: boolean;
  message: string;
  error?: string;
  emailId?: string;
}
