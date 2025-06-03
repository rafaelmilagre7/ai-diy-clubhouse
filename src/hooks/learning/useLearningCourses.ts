
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningCourse, LearningLesson, LearningModule } from "@/lib/supabase/types";
import { useAuth } from "@/contexts/auth";
import { ensureArray, ensureNumber, validateCourseData } from "@/lib/supabase/types/utils";

// Tipagem específica para a query com módulos e aulas
interface CourseWithModulesQuery extends LearningCourse {
  modules: Array<LearningModule & {
    lessons: LearningLesson[];
  }>;
}

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
      const restrictedIds = new Set(ensureArray(restrictedCourses).map(rc => rc.course_id));
      
      // Processar cursos com dados de módulos e aulas - COM VALIDAÇÃO DEFENSIVA
      const processedCourses = ensureArray(data as CourseWithModulesQuery[]).map(course => {
        // Validar dados básicos do curso
        const validatedCourse = validateCourseData(course);
        
        // Calcular contagem de módulos com validação
        const modules = ensureArray(course.modules);
        const moduleCount = modules.length;
        
        // Calcular contagem total de aulas em todos os módulos
        let lessonCount = 0;
        let lessons: any[] = [];
        
        modules.forEach((module: any) => {
          const moduleLessons = ensureArray(module?.lessons || []);
          lessonCount += moduleLessons.length;
          
          // Adicionar informações do curso e módulo a cada aula
          const enrichedLessons = moduleLessons.map(lesson => ({
            ...lesson,
            module: {
              id: module?.id || '',
              title: module?.title || "Módulo sem título",
              course: {
                id: course.id,
                title: course.title || "Curso sem título"
              }
            }
          }));
          
          lessons = [...lessons, ...enrichedLessons];
        });
        
        return {
          ...validatedCourse,
          is_restricted: restrictedIds.has(course.id),
          module_count: moduleCount,
          lesson_count: lessonCount,
          all_lessons: lessons // Lista plana de todas as aulas do curso
        };
      });
      
      // Se o usuário não estiver autenticado, filtrar os cursos restritos
      if (!user) {
        return processedCourses.filter(course => !course.is_restricted);
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
      
      return courses.flatMap(course => ensureArray(course.all_lessons));
    }
  };
};
