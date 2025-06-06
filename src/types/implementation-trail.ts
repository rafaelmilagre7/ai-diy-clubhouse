
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
  title?: string;
  moduleTitle?: string;
  courseTitle?: string;
}

export interface ImplementationTrail {
  priority1: TrailSolution[];
  priority2: TrailSolution[];
  priority3: TrailSolution[];
  recommended_courses?: TrailCourseRecommendation[];
  recommended_lessons?: TrailLessonRecommendation[];
}

export interface TrailSolutionEnriched extends TrailSolution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
  solution?: any;
}

export interface TrailCourseEnriched extends TrailCourseRecommendation {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  modules_count?: number;
}

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

// Parâmetros simplificados para geração da trilha
export type TrailGenerationParams = {
  user_id: string;
  preferences?: any;
} | null;
