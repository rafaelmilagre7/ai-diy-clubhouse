
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles?: {
    name: string;
    avatar_url: string;
    role?: string;
  };
  likes_count: number;
  user_has_liked?: boolean;
  replies?: Comment[];
}
