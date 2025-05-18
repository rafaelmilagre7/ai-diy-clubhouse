
import { Database } from './database.types';

// Tipos para os dados das tabelas do fórum
export type ForumCategory = Database['public']['Tables']['forum_categories']['Row'];
export type ForumTopic = Database['public']['Tables']['forum_topics']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumReaction = Database['public']['Tables']['forum_reactions']['Row'];
export type ReactionType = 'like' | 'helpful' | 'insightful' | 'celebrate';

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
