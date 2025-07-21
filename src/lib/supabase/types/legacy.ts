
// =============================================================================
// TIPOS DE COMPATIBILIDADE (SISTEMA LEGADO)
// =============================================================================

// Compatibilidade: Solution (sistema legado)
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'advanced';
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
  overview?: string;
  image_url?: string;
  learning_objectives?: string[];
  // Novos campos para implementação
  implementation_steps?: Array<{
    title: string;
    description?: string;
    instructions?: string;
    tips?: string[];
    resources?: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  }>;
  checklist_items?: Array<{
    id: string;
    title: string;
    description?: string;
    checked?: boolean;
  }>;
  completion_requirements?: string[];
  checklist?: Array<{
    id: string;
    title: string;
    description?: string;
    checked?: boolean;
  }>;
  videos?: Array<{
    title?: string;
    description?: string;
    url?: string;
    youtube_id?: string;
  }>;
}

// Compatibilidade: Module (sistema legado)
export interface Module {
  id: string;
  title: string;
  type: string;
  content?: {
    blocks?: any[];
    checklist?: Array<{
      id: string;
      title: string;
      description?: string;
      checked?: boolean;
    }>;
    videos?: Array<{
      title?: string;
      description?: string;
      url?: string;
      youtube_id?: string;
    }>;
  };
  solution_id?: string;
  module_order?: number;
  estimated_time_minutes?: number;
  created_at: string;
  updated_at: string;
  certificate_template?: any;
  metrics?: any;
}

// Compatibilidade: Progress (sistema legado)
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  last_activity: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Compatibilidade: UserChecklist (sistema legado)
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
