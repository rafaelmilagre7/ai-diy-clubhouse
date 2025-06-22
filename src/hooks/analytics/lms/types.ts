
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
}

export interface LmsAnalyticsData {
  npsData: LmsNpsData;
  statsData: LmsStatsData;
  feedbackData: LmsFeedbackData[];
}

// Interface corrigida para as respostas do Supabase com LEFT JOIN
export interface LessonNpsResponse {
  id: string;
  lesson_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  user_id: string;
  // Corrigindo: com LEFT JOIN, estas podem ser arrays ou null
  learning_lessons: Array<{ title: string }> | null;
  profiles: Array<{ name: string }> | null;
}

export interface ProgressResponse {
  progress_percentage: number;
}
