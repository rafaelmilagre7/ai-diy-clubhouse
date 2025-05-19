
import { SolutionCategory } from "@/lib/types/categoryTypes";

// Definição unificada de Solution que NÃO estende a SupabaseSolution para evitar referência circular
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
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
  author_id?: string;
  checklist_items?: any[];
}
