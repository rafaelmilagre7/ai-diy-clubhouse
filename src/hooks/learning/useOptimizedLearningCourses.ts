
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

interface OptimizedCourse {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  created_by: string;
  module_count: number;
  lesson_count: number;
  is_restricted: boolean;
  modules: any[];
  all_lessons: any[];
}

export const useOptimizedLearningCourses = (includeUnpublished = false) => {
  const { user } = useAuth();

  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["optimized-learning-courses", user?.id, includeUnpublished],
    queryFn: async () => {
      try {
        // Buscar cursos com contagem de módulos e aulas em uma query otimizada
        let query = supabase
          .from("learning_courses")
          .select(`
            id,
            title,
            description,
            cover_image_url,
            slug,
            published,
            created_at,
            updated_at,
            order_index,
            created_by
          `);

        // Filtrar apenas publicados se não for para incluir não publicados
        if (!includeUnpublished) {
          query = query.eq("published", true);
        }

        const { data: coursesData, error: coursesError } = await query
          .order("order_index", { ascending: true });

        if (coursesError) {
          console.error("Erro ao buscar cursos:", coursesError);
          throw coursesError;
        }

        if (!coursesData || coursesData.length === 0) {
          return [];
        }

        // Buscar contagem de módulos e aulas para cada curso
        const coursesWithStats = await Promise.all(
          coursesData.map(async (course) => {
            // Buscar módulos do curso
            const { data: modules, error: modulesError } = await supabase
              .from("learning_modules")
              .select(`
                id,
                title,
                description,
                order_index,
                course_id
              `)
              .eq("course_id", course.id)
              .eq("published", true)
              .order("order_index", { ascending: true });

            if (modulesError) {
              console.error("Erro ao buscar módulos:", modulesError);
              return {
                ...course,
                module_count: 0,
                lesson_count: 0,
                is_restricted: false,
                modules: [],
                all_lessons: []
              };
            }

            // Buscar aulas para cada módulo
            const modulesWithLessons = await Promise.all(
              (modules || []).map(async (module) => {
                const { data: lessons, error: lessonsError } = await supabase
                  .from("learning_lessons")
                  .select(`
                    id,
                    title,
                    description,
                    order_index,
                    cover_image_url,
                    estimated_time_minutes,
                    difficulty_level,
                    published
                  `)
                  .eq("module_id", module.id)
                  .eq("published", true)
                  .order("order_index", { ascending: true });

                if (lessonsError) {
                  console.error("Erro ao buscar aulas:", lessonsError);
                  return { ...module, lessons: [] };
                }

                return { 
                  ...module, 
                  lessons: (lessons || []).map(lesson => ({
                    ...lesson,
                    module: {
                      id: module.id,
                      title: module.title,
                      course: {
                        id: course.id,
                        title: course.title
                      }
                    }
                  }))
                };
              })
            );

            // Verificar se o curso tem restrições de acesso
            const { data: accessControl } = await supabase
              .from("course_access_control")
              .select("id")
              .eq("course_id", course.id)
              .limit(1);

            const isRestricted = !!(accessControl && accessControl.length > 0);

            // Contar módulos e aulas
            const moduleCount = modulesWithLessons.length;
            const allLessons = modulesWithLessons.flatMap(m => m.lessons || []);
            const lessonCount = allLessons.length;

            return {
              ...course,
              module_count: moduleCount,
              lesson_count: lessonCount,
              is_restricted: isRestricted,
              modules: modulesWithLessons,
              all_lessons: allLessons
            };
          })
        );

        // Se o usuário não estiver autenticado, filtrar cursos restritos
        if (!user) {
          return coursesWithStats.filter(course => !course.is_restricted);
        }

        return coursesWithStats;
      } catch (error) {
        console.error("Erro na query otimizada de cursos:", error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });

  return {
    courses,
    isLoading,
    error,
    getAllLessons: () => {
      if (!courses || courses.length === 0) return [];
      return courses.flatMap(course => course.all_lessons || []);
    }
  };
};
