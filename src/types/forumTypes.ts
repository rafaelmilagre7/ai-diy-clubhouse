
export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  views_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  is_solution: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  profiles?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}
