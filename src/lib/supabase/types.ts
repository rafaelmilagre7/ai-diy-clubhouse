import { Database } from './database.types';

// Basic types from database - handle missing tables gracefully
export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  resources?: LearningResource[];
  videos?: LearningLessonVideo[];
  module?: LearningModule;
  ai_assistant_id?: string;
  estimated_duration_minutes?: number;
};

export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'] & {
  is_published?: boolean;
};
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];

// Handle learning_progress table - may not exist in current schema
export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  video_progress: Record<string, number>;
  started_at: string;
  completed_at: string | null;
  last_position_seconds?: number;
  updated_at: string;
  created_at: string;
  notes?: string | null;
};

// Tipos específicos do sistema
export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  tags?: string[];
  published?: boolean;
  slug?: string;
  expected_results?: string;
  success_metrics?: string;
  target_audience?: string;
  prerequisites?: string;
  difficulty_level?: string;
  difficulty?: string; // Add fallback for compatibility
};

export type UserProfile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: {
    id: string;
    name: string;
    description?: string;
  };
};
export type UserRole = Database['public']['Tables']['user_roles']['Row'];

// Use the correct table name from the schema  
export type Module = Database['public']['Tables']['modules']['Row'] & {
  description?: string;
  module_order?: number;
};

// Handle progress table - may have different structure
export type Progress = {
  id: string;
  user_id: string;
  solution_id: string;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
  created_at: string;
};

export type Tool = Database['public']['Tables']['tools']['Row'] & {
  status?: boolean;
  official_url?: string;
  tags?: string[];
  benefit_link?: string | null;
  benefit_title?: string | null;
  benefit_description?: string | null;
  benefit_discount_percentage?: number | null;
  has_member_benefit?: boolean;
};
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];

// Simplified types for compatibility - Updated with all required properties
export interface SimplifiedSolution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  difficulty_level?: string;
  thumbnail_url?: string;
  cover_image_url?: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  estimated_time_hours?: number;
  roi_potential?: string;
  implementation_steps?: any;
  required_tools?: string[];
  expected_results: string;
  success_metrics: string;
  target_audience: string;
  prerequisites: string;
}

export interface SimplifiedTool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string | null;
  logo_url: string | null;
  pricing_info: any;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_member_benefit: boolean;
  benefit_type: string | null;
  benefit_discount_percentage?: number | null;
  benefit_link?: string | null;
  benefit_title?: string | null;
  benefit_description?: string | null;
  status?: boolean;
}

// User checklist type for progress tracking
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  updated_at: string;
  created_at: string;
}

// Content block interface for modules
export interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface ModuleContent {
  blocks: ContentBlock[];
}

// Re-exportação das definições de tipos base
export * from './database.types';

// Utilitário para type casting seguro
export const safeSupabaseQuery = <T = any>(query: Promise<any>): Promise<{ data: T | null; error: any }> => {
  return query.catch((error: any) => ({ data: null, error }));
};

// Safe JSON parsing utilities
export const safeJsonParseObject = (value: any, fallback: any = {}) => {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const safeJsonParseArray = (value: any, fallback: any[] = []) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

// Safe conversion from Json to ModuleContent
export const safeJsonToModuleContent = (content: any): ModuleContent => {
  if (content && typeof content === 'object' && content.blocks) {
    return content as ModuleContent;
  }
  return { blocks: [] };
};

// Safe conversion to string for dangerouslySetInnerHTML
export const safeToStringContent = (content: any): string => {
  if (typeof content === 'string') {
    return content;
  }
  if (typeof content === 'object' && content !== null) {
    return JSON.stringify(content);
  }
  return String(content || '');
};

// Helper function to determine if auto-complete should happen
export const shouldAutoComplete = (moduleType: string): boolean => {
  return ['landing', 'celebration'].includes(moduleType);
};

// Add getUserRoleName function for compatibility
export const getUserRoleName = (profile: UserProfile): string => {
  return profile.user_roles?.name || profile.role || 'member';
};

// Solution category type
export type SolutionCategory = 'Receita' | 'Operacional' | 'Estratégia';

// Safe category type conversion
export const safeSolutionCategory = (category: string): SolutionCategory => {
  if (['Receita', 'Operacional', 'Estratégia'].includes(category)) {
    return category as SolutionCategory;
  }
  return 'Receita'; // Default fallback
};
