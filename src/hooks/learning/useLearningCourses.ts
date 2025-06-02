
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourseWithLessons } from "@/lib/supabase/types/learning";

export const useLearningCourses = () => {
  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["learning-courses"],
    queryFn: async (): Promise<LearningCourseWithLessons[]> => {
      // Buscar cursos publicados
      const { data: coursesData, error: coursesError } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (coursesError) {
        console.error("Erro ao buscar cursos:", coursesError);
        throw coursesError;
      }

      if (!coursesData || coursesData.length === 0) {
        return [];
      }

      // Para cada curso, buscar estatísticas de módulos e aulas
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          // Buscar módulos do curso
          const { data: modules } = await supabase
            .from("learning_modules")
            .select("id")
            .eq("course_id", course.id)
            .eq("published", true);

          const moduleCount = modules?.length || 0;

          if (moduleCount === 0) {
            return {
              ...course,
              module_count: 0,
              lesson_count: 0,
              all_lessons: []
            };
          }

          // Buscar aulas dos módulos
          const moduleIds = modules!.map(m => m.id);
          const { data: lessons } = await supabase
            .from("learning_lessons")
            .select("*")
            .in("module_id", moduleIds)
            .eq("published", true);

          const lessonCount = lessons?.length || 0;

          return {
            ...course,
            module_count: moduleCount,
            lesson_count: lessonCount,
            all_lessons: lessons || []
          };
        })
      );

      return coursesWithStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });

  return {
    courses,
    isLoading,
    error
  };
};
