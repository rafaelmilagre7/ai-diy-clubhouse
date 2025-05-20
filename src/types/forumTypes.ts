
export interface Profile {
  id?: string;
  name: string | null;
  avatar_url: string | null;
  role?: string;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id?: string | null;
  profiles?: Profile | null;
  replies?: Post[];
  is_solution?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  profiles?: Profile;
}
