
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  parent_id?: string;
  replies?: Comment[];
  user_has_liked?: boolean;
  profiles?: {
    name: string;
    avatar_url?: string;
    role?: string;
    id: string;
  };
  user?: {
    name: string;
    avatar_url?: string;
    id: string;
  };
}
