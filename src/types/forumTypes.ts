
export interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  role?: string; // Adicionando propriedade role
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  is_solution: boolean;
  profiles: Profile;
  replies?: Post[];
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  reply_count: number;
  is_locked: boolean;
  is_pinned: boolean;
  user_id: string;
  category_id: string;
  last_activity_at: string;
  profiles: Profile;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
