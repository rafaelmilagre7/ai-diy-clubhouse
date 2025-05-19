
import { Solution as SupabaseSolution } from "@/lib/supabase";
import { SolutionCategory } from "@/lib/types/categoryTypes";

// Definição unificada de Solution que estende a SupabaseSolution
export interface Solution extends Omit<SupabaseSolution, 'author_id'> {
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
  author_id?: string; // Tornando author_id opcional para compatibilidade
}
