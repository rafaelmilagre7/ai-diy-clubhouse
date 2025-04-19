
export type SuggestionStatus = 'new' | 'under_review' | 'approved' | 'in_development' | 'implemented' | 'rejected';
export type VoteType = 'upvote' | 'downvote';
export type NotificationType = 'status_change' | 'new_comment' | 'new_vote' | 'comment_reply' | 'admin_response';

export interface SuggestionCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  user_id: string;
  category_id: string | null;
  status: SuggestionStatus;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  is_hidden: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuggestionVote {
  id: string;
  suggestion_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
}

export interface SuggestionComment {
  id: string;
  suggestion_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  is_official: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuggestionNotification {
  id: string;
  user_id: string;
  suggestion_id: string;
  comment_id: string | null;
  type: NotificationType;
  content: string | null;
  is_read: boolean;
  created_at: string;
}
