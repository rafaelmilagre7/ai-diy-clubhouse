
import { Database } from './database.types';

// =============================================================================
// TIPOS DO SISTEMA LEARNING (LMS)
// =============================================================================

export type LearningLesson = Database['public']['Tables']['learning_lessons']['Row'] & {
  ai_assistant_id?: string;
};

export type LearningLessonVideo = Database['public']['Tables']['learning_lesson_videos']['Row'];
export type LearningModule = Database['public']['Tables']['learning_modules']['Row'];
export type LearningCourse = Database['public']['Tables']['learning_courses']['Row'];
export type LearningProgress = Database['public']['Tables']['learning_progress']['Row'];
export type LearningResource = Database['public']['Tables']['learning_resources']['Row'];
export type LearningLessonTool = Database['public']['Tables']['learning_lesson_tools']['Row'];
export type LearningComment = Database['public']['Tables']['learning_comments']['Row'];
export type LearningLessonNps = Database['public']['Tables']['learning_lesson_nps']['Row'];

export type LearningCertificate = Database['public']['Tables'] extends { learning_certificates: any } 
  ? Database['public']['Tables']['learning_certificates']['Row']
  : {
      id: string;
      user_id: string;
      course_id: string;
      certificate_url?: string;
      issued_at: string;
      created_at: string;
    };
