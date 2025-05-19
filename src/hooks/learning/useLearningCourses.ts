
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth";

export const useLearningCourses = () => {
  const { user } = useAuth();

  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["learning-courses", user?.id],
    queryFn: async () => {
      // Buscar todos os cursos publicados
      const { data, error } = await supabase
        .from("learning_courses")
        .select(`
          *,
          modules:learning_modules(count),
          lessons:learning_modules(
            lessons:learning_lessons(count)
          )
        `)
        .eq("published", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Erro ao buscar cursos:", error);
        throw error;
      }

      // Buscar os cursos restritos (que têm controle de acesso)
      const { data: restrictedCourses, error: restrictedError } = await supabase
        .from("course_access_control")
        .select("course_id");

      if (restrictedError) {
        console.error("Erro ao buscar cursos restritos:", restrictedError);
        throw restrictedError;
      }

      // Criar um conjunto com IDs dos cursos restritos para acesso mais rápido
      const restrictedIds = new Set(restrictedCourses?.map(rc => rc.course_id) || []);
      
      // Processar cursos com dados de módulos e aulas
      const processedCourses = data.map(course => {
        // Calcular contagem de módulos
        const moduleCount = course.modules?.length || 0;
        
        // Calcular contagem total de aulas em todos os módulos
        let lessonCount = 0;
        if (course.modules) {
          course.modules.forEach(module => {
            lessonCount += (module.lessons?.length || 0);
          });
        }
        
        return {
          ...course,
          is_restricted: restrictedIds.has(course.id),
          module_count: moduleCount,
          lesson_count: lessonCount
        };
      });
      
      // Se o usuário não estiver autenticado, filtrar os cursos restritos
      if (!user) {
        return processedCourses.filter(course => !course.is_restricted);
      }

      return processedCourses;
    }
  });

  return {
    courses,
    isLoading,
    error
  };
};
