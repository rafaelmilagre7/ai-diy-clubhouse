import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';

export interface CourseStats {
  courseId: string;
  courseName: string;
  totalLessons: number;
  totalModules: number;
  usersStarted: number;
  usersCompleted: number;
  averageProgress: number;
  completionRate: number;
  activeEnrollments: number;
}

export interface ProgressDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface RealLmsAnalytics {
  totalCourses: number;
  totalLessons: number;
  coursesStarted: number;
  coursesCompleted: number;
  averageProgress: number;
  activeEnrollments: number;
  courseStats: CourseStats[];
  progressDistribution: ProgressDistribution[];
}

const getDateRange = (timeRange: string) => {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '7d':
      startDate = subDays(now, 7);
      break;
    case '30d':
      startDate = subDays(now, 30);
      break;
    case '90d':
      startDate = subDays(now, 90);
      break;
    case '6m':
      startDate = subMonths(now, 6);
      break;
    case '1y':
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subDays(now, 30);
  }

  return {
    start: startOfDay(startDate).toISOString(),
    end: endOfDay(now).toISOString()
  };
};

export const useRealLmsAnalytics = (timeRange: string = '30d') => {
  return useQuery({
    queryKey: ['real-lms-analytics', timeRange],
    queryFn: async (): Promise<RealLmsAnalytics> => {
      const dateRange = getDateRange(timeRange);

      // 1. Buscar total de cursos e aulas
      const { data: coursesData, error: coursesError } = await supabase
        .from('learning_courses')
        .select(`
          id,
          title,
          learning_modules (
            id,
            learning_lessons (id)
          )
        `)
        .eq('published', true);

      if (coursesError) throw coursesError;

      const totalCourses = coursesData?.length || 0;
      const totalLessons = coursesData?.reduce((acc, course) => {
        const modules = course.learning_modules || [];
        return acc + modules.reduce((modAcc, mod) => {
          return modAcc + (mod.learning_lessons?.length || 0);
        }, 0);
      }, 0) || 0;

      // 2. Buscar progresso de todos os usuários
      const { data: progressData, error: progressError } = await supabase
        .from('learning_progress')
        .select(`
          user_id,
          lesson_id,
          completed_at,
          progress_percentage,
          learning_lessons (
            id,
            module_id,
            learning_modules (
              id,
              course_id,
              learning_courses (id, title)
            )
          )
        `)
        .order('completed_at', { ascending: false, nullsFirst: false });

      if (progressError) throw progressError;

      // 3. Processar dados por curso
      const courseStatsMap = new Map<string, {
        courseName: string;
        totalLessons: number;
        totalModules: Set<string>;
        usersProgress: Map<string, { 
          completed: number; 
          total: number; 
          hasActivity: boolean;
          firstCompletionDate: string | null;
          lastCompletionDate: string | null;
        }>;
        usersCompleted: Set<string>;
      }>();

      // Inicializar com todos os cursos
      coursesData?.forEach(course => {
        const modules = (course.learning_modules || []) as any[];
        const lessons = modules.reduce((acc: number, mod: any) => {
          const lessonsList = (mod.learning_lessons || []) as any[];
          return acc + lessonsList.length;
        }, 0);
        
        courseStatsMap.set(course.id, {
          courseName: course.title,
          totalLessons: lessons,
          totalModules: new Set(modules.map((m: any) => m.id)),
          usersProgress: new Map(),
          usersCompleted: new Set()
        });
      });

      // Processar progresso
      progressData?.forEach(progress => {
        const lesson = progress.learning_lessons as any;
        if (!lesson || !lesson.learning_modules) return;

        const module = lesson.learning_modules as any;
        if (!module || !module.learning_courses) return;

        const course = module.learning_courses as any;
        const courseId = course.id;
        const userId = progress.user_id;

        const courseStats = courseStatsMap.get(courseId);
        if (!courseStats) return;

        // Verificar se está no período
        const hasActivityInPeriod = progress.completed_at && 
          progress.completed_at >= dateRange.start && 
          progress.completed_at <= dateRange.end;

        if (!courseStats.usersProgress.has(userId)) {
          courseStats.usersProgress.set(userId, {
            completed: 0,
            total: courseStats.totalLessons,
            hasActivity: hasActivityInPeriod || false,
            firstCompletionDate: null,
            lastCompletionDate: null
          });
        }

        const userProgress = courseStats.usersProgress.get(userId)!;
        if (progress.completed_at !== null) {
          userProgress.completed++;
          
          // Rastrear primeira data de conclusão
          if (!userProgress.firstCompletionDate || 
              progress.completed_at < userProgress.firstCompletionDate) {
            userProgress.firstCompletionDate = progress.completed_at;
          }
          
          // Rastrear última data de conclusão
          if (!userProgress.lastCompletionDate || 
              progress.completed_at > userProgress.lastCompletionDate) {
            userProgress.lastCompletionDate = progress.completed_at;
          }
        }
        if (hasActivityInPeriod) {
          userProgress.hasActivity = true;
        }

        // Verificar se completou o curso
        if (userProgress.completed >= courseStats.totalLessons) {
          courseStats.usersCompleted.add(userId);
        }
      });

      // 4. Calcular estatísticas agregadas
      const courseStats: CourseStats[] = Array.from(courseStatsMap.entries()).map(([courseId, stats]) => {
      const usersWithProgress = Array.from(stats.usersProgress.values());
      
      // Usuários que INICIARAM no período (primeira aula concluída no período)
      const usersStarted = usersWithProgress.filter(u => 
        u.completed > 0 && 
        u.firstCompletionDate &&
        u.firstCompletionDate >= dateRange.start &&
        u.firstCompletionDate <= dateRange.end
      ).length;
      
      // Usuários que COMPLETARAM no período (última aula concluída no período)
      const usersCompleted = usersWithProgress.filter(u => 
        u.completed >= stats.totalLessons &&
        u.lastCompletionDate &&
        u.lastCompletionDate >= dateRange.start &&
        u.lastCompletionDate <= dateRange.end
      ).length;
        const activeEnrollments = usersWithProgress.filter(u => u.hasActivity).length;
        
        const averageProgress = usersWithProgress.length > 0
          ? Math.round(
              usersWithProgress.reduce((acc, u) => acc + (u.completed / u.total * 100), 0) / usersWithProgress.length
            )
          : 0;

        const completionRate = usersStarted > 0
          ? Math.round((usersCompleted / usersStarted) * 100)
          : 0;

        return {
          courseId,
          courseName: stats.courseName,
          totalLessons: stats.totalLessons,
          totalModules: stats.totalModules.size,
          usersStarted,
          usersCompleted,
          averageProgress,
          completionRate,
          activeEnrollments
        };
      });

      // 5. Calcular totais
      const coursesStarted = courseStats.reduce((acc, c) => acc + c.usersStarted, 0);
      const coursesCompleted = courseStats.reduce((acc, c) => acc + c.usersCompleted, 0);
      const averageProgress = courseStats.length > 0
        ? Math.round(courseStats.reduce((acc, c) => acc + c.averageProgress, 0) / courseStats.length)
        : 0;
      const activeEnrollments = courseStats.reduce((acc, c) => acc + c.activeEnrollments, 0);

      // 6. Calcular distribuição de progresso
      const allUsersProgress: number[] = [];
      courseStatsMap.forEach(stats => {
        stats.usersProgress.forEach(userProg => {
          const percentage = (userProg.completed / userProg.total) * 100;
          allUsersProgress.push(percentage);
        });
      });

      const progressRanges = [
        { range: '0-25%', min: 0, max: 25 },
        { range: '26-50%', min: 26, max: 50 },
        { range: '51-75%', min: 51, max: 75 },
        { range: '76-100%', min: 76, max: 100 }
      ];

      const progressDistribution: ProgressDistribution[] = progressRanges.map(range => {
        const count = allUsersProgress.filter(p => p >= range.min && p <= range.max).length;
        const percentage = allUsersProgress.length > 0
          ? Math.round((count / allUsersProgress.length) * 100)
          : 0;
        return { range: range.range, count, percentage };
      });

      return {
        totalCourses,
        totalLessons,
        coursesStarted,
        coursesCompleted,
        averageProgress,
        activeEnrollments,
        courseStats,
        progressDistribution
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000
  });
};
