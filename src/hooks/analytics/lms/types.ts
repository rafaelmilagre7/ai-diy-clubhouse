
// Interfaces para os dados de analytics do LMS
export interface LmsNpsData {
  overall: number;
  distribution: {
    promoters: number;
    neutrals: number;
    detractors: number;
  };
  perLesson: Array<{
    lessonId: string;
    lessonTitle: string;
    courseTitle?: string;
    npsScore: number;
    responseCount: number;
  }>;
}

export interface LmsStatsData {
  totalStudents: number;
  totalLessons: number;
  completionRate: number;
  npsScore: number;
}

export interface LmsFeedbackData {
  id: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  feedback: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  moduleTitle: string;
  courseTitle: string;
  moduleId?: string;
  courseId?: string;
}

export interface LmsAnalyticsData {
  npsData: LmsNpsData;
  statsData: LmsStatsData;
  feedbackData: LmsFeedbackData[];
}

// Interfaces para dados de evolução de NPS
export interface NPSMonthlyEvolution {
  month: string;
  nps_score: number;
  total_responses: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  avg_score: number;
}

export interface NPSByCourse {
  course_id: string;
  course_title: string;
  nps_score: number;
  total_responses: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  avg_score: number;
}

export interface NPSCourseEvolution {
  course_id: string;
  course_title: string;
  month: string;
  nps_score: number;
  total_responses: number;
}

export interface NPSEvolutionData {
  monthlyEvolution: NPSMonthlyEvolution[];
  coursesNPS: NPSByCourse[];
  courseEvolution: NPSCourseEvolution[];
}

// Interfaces atualizadas para as respostas do Supabase
export interface LessonNpsResponse {
  id: string;
  lesson_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  user_id: string;
  // Definição mais precisa das junções LEFT JOIN
  learning_lessons: { 
    title: string;
    module_id: string;
    learning_modules?: {
      title: string;
      course_id: string;
      learning_courses?: {
        title: string;
      } | null;
    } | null;
  } | null;
  profiles: { 
    name: string;
    email: string;
  } | null;
}

export interface ProgressResponse {
  progress_percentage: number;
}
