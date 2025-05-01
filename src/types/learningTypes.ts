
export interface Comment {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
  likes_count?: number;
  user_has_liked?: boolean;
  profiles?: {
    name: string;
    avatar_url?: string;
    role?: string;
  };
  replies?: Comment[];
}
