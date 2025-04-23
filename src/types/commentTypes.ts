
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  parent_id?: string;
  replies?: Comment[];
  has_liked?: boolean;
  user?: {
    name: string;
    avatar_url?: string;
    id: string;
  };
}
