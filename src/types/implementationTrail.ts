// Tipos centralizados para Implementation Trail
export interface SolutionItem {
  solutionId: string;
  justification: string;
  aiScore?: number;
  estimatedTime?: string;
}

export interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
}

export interface ImplementationTrailData {
  priority1: SolutionItem[];
  priority2: SolutionItem[];
  priority3: SolutionItem[];
  recommended_lessons?: RecommendedLesson[];
  ai_message?: string;
  generated_at: string;
}

// Tipo para o banco de dados
export interface ImplementationTrailRecord {
  id: string;
  user_id: string;
  trail_data: ImplementationTrailData;
  status: 'draft' | 'active' | 'completed' | 'paused';
  generation_attempts: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}