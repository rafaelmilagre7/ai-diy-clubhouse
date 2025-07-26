import { LearningResource } from "@/lib/supabase";

export interface RecursoWithDetails extends LearningResource {
  lesson?: {
    id: string;
    title: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
      };
    };
  };
}

export interface MaterialStats {
  total: number;
  arquivos: number;
  links: number;
  videos: number;
  favoritos?: number;
  recentes?: number;
}

export interface MaterialFilters {
  search: string;
  course: string;
  type: string;
  dateRange: string;
  sizeRange: string;
  showFavorites: boolean;
}

export type ViewMode = 'grid' | 'list' | 'hierarchy';