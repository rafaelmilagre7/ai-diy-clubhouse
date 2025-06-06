
export interface TrailSolution {
  solutionId: string;
  justification?: string;
  priority?: number;
}

export interface TrailCourseRecommendation {
  courseId: string;
  justification?: string;
  priority?: number;
}

export interface TrailLessonRecommendation {
  lessonId: string;
  moduleId: string;
  courseId: string;
  justification?: string;
  priority?: number;
  title?: string;          // Título da aula
  moduleTitle?: string;    // Título do módulo
  courseTitle?: string;    // Título do curso
}

export interface ImplementationTrail {
  priority1: TrailSolution[];
  priority2: TrailSolution[];
  priority3: TrailSolution[];
  recommended_courses?: TrailCourseRecommendation[];
  recommended_lessons?: TrailLessonRecommendation[];
}

// Interface para a solução enriquecida com detalhes da trilha
export interface TrailSolutionEnriched extends TrailSolution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
  solution?: any;  // Detalhes completos da solução
}

// Interface para o curso recomendado na trilha
export interface TrailCourseEnriched extends TrailCourseRecommendation {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  modules_count?: number;
}

// Interface para a aula recomendada na trilha
export interface TrailLessonEnriched extends TrailLessonRecommendation {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  estimated_time_minutes?: number;
  difficulty_level?: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    }
  }
}

// Parâmetros para geração da trilha - simplificado sem dependência de onboarding
export type TrailGenerationParams = {
  user_id: string;
  preferences?: any;
} | null;
