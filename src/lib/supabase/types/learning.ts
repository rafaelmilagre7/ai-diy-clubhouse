
import { LearningCourse, LearningLesson, LearningModule } from './index';

// Tipo estendido do LearningCourse com propriedades calculadas
export interface LearningCourseWithLessons extends LearningCourse {
  all_lessons?: LearningLesson[];
  module_count?: number;
  lesson_count?: number;
  is_restricted?: boolean;
  modules?: (LearningModule & {
    lessons?: LearningLesson[];
  })[];
}
