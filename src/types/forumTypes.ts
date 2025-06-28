
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
