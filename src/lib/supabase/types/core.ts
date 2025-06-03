
// Tipos centralizados e consolidados do sistema
export * from './database.types';

export type UserRole = 'admin' | 'member' | 'formacao';

// === USER TYPES ===
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: UserRole;
  role_id?: string;
  user_roles?: any;
  created_at: string;
}

// === SOLUTION TYPES ===
export type SolutionCategory = 'Receita' | 'Operacional' | 'Estratégia';

export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: SolutionCategory;
  image_url?: string;
  thumbnail_url?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  slug: string;
  status?: string;
  completion_percentage?: number;
  overview?: string;
  estimated_time?: number;
  success_rate?: number;
  tags?: string[];
  videos?: any[];
  checklist?: any[];
  module_order?: number;
  related_solutions?: string[];
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  order: number;
  module_order?: number;
  type: string;
  content?: any;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  completed_at?: string;
  last_activity: string;
  created_at: string;
}

export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// === ADDITIONAL TYPES ===
export type Database = any; // Tipo do banco de dados
export type Analytics = any; // Tipo de analytics
export type ForumCategory = any; // Tipo de categoria do fórum
export type ForumTopic = any; // Tipo de tópico do fórum
export type ForumPost = any; // Tipo de post do fórum
export type Tool = any; // Tipo de ferramenta
export type Event = any; // Tipo de evento
export type Course = any; // Tipo de curso (diferente de LearningCourse)
export type Lesson = any; // Tipo de aula (diferente de LearningLesson)
export type Resource = any; // Tipo de recurso (diferente de LearningResource)
export type ImplementationTrail = any; // Tipo de trilha de implementação
