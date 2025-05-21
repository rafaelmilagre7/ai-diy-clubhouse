
export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topic_count?: number;
  color?: string;
  icon?: string;
  order?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string | null;
  role?: string;
  user_id?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string | null;
  email?: string;
  role?: string;
  role_id?: string;
  company_name?: string;
  industry?: string;
  current_position?: string;
  professional_bio?: string;
  skills?: string[];
  linkedin_url?: string;
  available_for_networking?: boolean;
  last_active?: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  last_activity_at: string;
  profiles?: UserProfile | null;
  category?: ForumCategory | null;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  profiles?: UserProfile | null;
  is_accepted_solution?: boolean;
  is_solution?: boolean;
  parent_id?: string | null;
}

export interface MemberConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ConnectionMember {
  id: string;
  name: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  current_position?: string | null;
  industry?: string | null;
}
