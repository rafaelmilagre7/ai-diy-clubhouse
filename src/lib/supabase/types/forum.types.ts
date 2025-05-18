

// Tipos simples que serão utilizados nas interfaces
export type ForumCategory = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumTopic = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type ForumPost = {
  id: string;
  topic_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_solution: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type ForumReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like' | 'helpful' | 'insightful' | 'celebrate';
  created_at: string;
};

// Tipos estendidos com informações adicionais
export interface ForumTopicWithMeta extends ForumTopic {
  author?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
    slug: string;
  };
  is_author?: boolean;
}

export interface ForumPostWithMeta extends ForumPost {
  author?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
  reactions?: {
    count: number;
    user_reacted: boolean;
  };
  replies?: ForumPostWithMeta[];
  is_author?: boolean;
}
