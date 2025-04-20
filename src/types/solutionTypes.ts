
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  slug: string;
  tags?: string[];
  estimated_time?: number;
  success_rate?: number;
  related_solutions?: string[];
}
