
export type SolutionCategory = "revenue" | "operational" | "strategy";

export interface SolutionBase {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
  thumbnail_url?: string;
  difficulty: "easy" | "medium" | "advanced";
  slug: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

export interface SolutionWithModules extends SolutionBase {
  modules: any[];
}
