
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourse, LearningLesson, LearningModule } from "@/lib/supabase/types";
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
      // Buscar todos os cursos publicados com módulos e aulas
      const { data, error } = await supabase
        .from("learning_courses")
        .select(`
          *,
          modules:learning_modules(
            id, 
            title, 
            description,
            order_index,
            lessons:learning_lessons(
              id, 
              title, 
              description,
              order_index,
              cover_image_url,
              estimated_time_minutes,
              difficulty_level
            )
          )
        `)
        .eq("published", true as any)
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
      const restrictedIds = new Set(restrictedCourses?.map(rc => (rc as any).course_id) || []);
      
      // Processar cursos com dados de módulos e aulas
      const processedCourses = (data as any || []).map((course: any) => {
        // Calcular contagem de módulos
        const moduleCount = course.modules?.length || 0;
        
        // Calcular contagem total de aulas em todos os módulos
        let lessonCount = 0;
        let lessons = [];
        
        if (course.modules) {
          course.modules.forEach((module: any) => {
            if (module.lessons) {
              lessonCount += module.lessons.length;
              
              // Adicionar informações do curso e módulo a cada aula
              const moduleLessons = module.lessons.map((lesson: any) => ({
                ...lesson,
                module: {
                  id: module.id,
                  title: module.title,
                  course: {
                    id: course.id,
                    title: course.title
                  }
                }
              }));
              
              lessons = [...lessons, ...moduleLessons];
            }
          });
        }
        
        return {
          ...course,
          is_restricted: restrictedIds.has(course.id),
          module_count: moduleCount,
          lesson_count: lessonCount,
          all_lessons: lessons // Lista plana de todas as aulas do curso
        };
      });
      
      // Se o usuário não estiver autenticado, filtrar os cursos restritos
      if (!user) {
        return processedCourses.filter((course: any) => !course.is_restricted);
      }

      return processedCourses;
    },
    enabled: true // Sempre buscar os cursos disponíveis
  });

  return {
    courses,
    isLoading,
    error,
    // Método de conveniência para obter todas as aulas de todos os cursos
    getAllLessons: () => {
      if (!courses || courses.length === 0) return [];
      
      return courses.flatMap((course: any) => course.all_lessons || []);
    }
  };
};
