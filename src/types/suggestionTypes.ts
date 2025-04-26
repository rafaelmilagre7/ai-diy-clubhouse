

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  user_id: string;
  status: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_hidden: boolean;
  image_url?: string;
  category_id?: string;
  user_name?: string;
  user_avatar?: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
  replies?: Suggestion[];
  // Modificando a propriedade category para ser um objeto ou string
  // para manter compatibilidade com dados existentes
  category?: string | { name: string };
  is_implemented?: boolean; // Indica se a sugestão foi implementada
}

export interface SuggestionComment {
  id: string;
  content: string;
  user_id: string;
  suggestion_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  is_hidden: boolean;
  is_official: boolean;
  profiles?: {
    name: string;
    avatar_url: string;
  };
  replies?: SuggestionComment[];
}

export interface SuggestionCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationType {
  id: string;
  user_id: string;
  suggestion_id?: string;
  comment_id?: string;
  type: 'upvote' | 'downvote' | 'comment' | 'reply' | 'status_change';
  is_read: boolean;
  created_at: string;
  suggestion?: {
    title: string;
  };
  comment?: {
    content: string;
  };
  profiles?: {
    name: string;
    avatar_url: string;
  };
}

export type SuggestionStatus = 'new' | 'under_review' | 'in_development' | 'completed' | 'declined';
export type VoteType = 'upvote' | 'downvote';

export interface UserVote {
  id: string;
  vote_type: VoteType;
}

