
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export type NotificationType = 
  | 'message'
  | 'connection_request'
  | 'connection_accepted'
  | 'forum_reply'
  | 'forum_mention'
  | 'system'
  | 'event';
