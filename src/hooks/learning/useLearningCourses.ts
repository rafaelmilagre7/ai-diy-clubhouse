
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
      try {
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
          .eq("published", true)
          .order("order_index", { ascending: true });

        if (error) {
          console.error("Erro ao buscar cursos:", error);
          // Se erro de autenticação, retornar array vazio em vez de falhar
          if (error.message?.includes('JWT') || error.message?.includes('unauthorized')) {
            console.warn("Usuário não autenticado, retornando cursos públicos apenas");
            return [];
          }
          throw error;
        }

        // Buscar os cursos restritos (que têm controle de acesso)
        let restrictedCourses: any[] = [];
        try {
          const { data: restrictedData, error: restrictedError } = await supabase
            .from("course_access_control")
            .select("course_id");

          if (!restrictedError) {
            restrictedCourses = restrictedData || [];
          }
        } catch (restrictedErr) {
          console.warn("Não foi possível verificar cursos restritos:", restrictedErr);
        }

        // Criar um conjunto com IDs dos cursos restritos para acesso mais rápido
        const restrictedIds = new Set(restrictedCourses.map(rc => rc.course_id) || []);
        
        // Processar cursos com dados de módulos e aulas
        const processedCourses = (data || []).map((course: any) => {
          // Calcular contagem de módulos
          const moduleCount = course.modules?.length || 0;
          
          // Calcular contagem total de aulas em todos os módulos
          let lessonCount = 0;
          let lessons: any[] = [];
          
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
      } catch (err) {
        console.error("Erro geral ao buscar cursos:", err);
        // Em caso de erro, retornar array vazio para não quebrar a UI
        return [];
      }
    },
    enabled: true, // Sempre buscar os cursos disponíveis
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for erro de autenticação
      if (error?.message?.includes('JWT') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 3;
    }
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
