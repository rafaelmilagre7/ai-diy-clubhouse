
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
      
      // Se o usuário não estiver autenticado, filtrar os cursos restritos
      if (!user) {
        const filteredCourses = data.filter(course => !restrictedIds.has(course.id));
        
        return filteredCourses.map(course => ({
          ...course,
          is_restricted: restrictedIds.has(course.id),
          module_count: course.modules ? course.modules.length : 0,
          lesson_count: course.modules ? course.modules.reduce((count, module) => {
            return count + (module.lessons ? module.lessons.length : 0);
          }, 0) : 0
        }));
      }

      // Processar contagens de módulos e aulas para todos os cursos
      return data.map(course => ({
        ...course,
        is_restricted: restrictedIds.has(course.id),
        module_count: course.modules ? course.modules.length : 0,
        lesson_count: course.modules ? course.modules.reduce((count, module) => {
          return count + (module.lessons ? module.lessons.length : 0);
        }, 0) : 0
      }));
    }
  });

  return {
    courses,
    isLoading,
    error
  };
};
