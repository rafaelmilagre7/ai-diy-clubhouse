
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson, LearningModule } from "@/lib/supabase/types";
import { LearningCourseWithStats } from "@/lib/supabase/types/extended";
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
      console.log("🔍 HOOK: Iniciando busca de cursos...");
      
      // Primeira tentativa: usar a function SQL
      const { data, error } = await supabase.rpc('get_courses_with_stats');

      if (error) {
        console.error("⚠️ HOOK: Erro na função RPC, tentando fallback direto:", error);
        
        // FALLBACK DE EMERGÊNCIA: Query direta na tabela
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('learning_courses')
          .select(`
            id,
            title,
            description,
            cover_image_url,
            slug,
            published,
            created_at,
            updated_at,
            created_by,
            order_index
          `)
          .eq('published', true)
          .order('order_index');

        if (fallbackError) {
          console.error("❌ HOOK: Fallback também falhou:", fallbackError);
          throw fallbackError;
        }

        console.log("✅ HOOK: Fallback funcionou, cursos encontrados:", fallbackData?.length || 0);
        
        // Converter para formato com stats zeradas
        const coursesWithStats = (fallbackData || []).map(course => ({
          ...course,
          module_count: 0,
          lesson_count: 0,
          is_restricted: false
        }));
        
        if (!coursesWithStats || coursesWithStats.length === 0) {
          return [];
        }

        console.log("📊 HOOK: Retornando cursos via fallback:", coursesWithStats.length);
        return coursesWithStats;
      }

      console.log("✅ HOOK: RPC funcionou, cursos encontrados:", data?.length || 0);

      if (!data || data.length === 0) {
        return [];
      }

      // Filtrar cursos únicos por ID (garantir não duplicação)
      const uniqueCourses = data.reduce((acc: LearningCourseWithStats[], current: LearningCourseWithStats) => {
        const exists = acc.find(course => course.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Buscar módulos e aulas para cada curso único
      const coursesWithModules = await Promise.all(
        uniqueCourses.map(async (course: LearningCourseWithStats) => {
          const { data: modules, error: modulesError } = await supabase
            .from("learning_modules")
            .select(`
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
            `)
            .eq("course_id", course.id)
            .eq("published", true)
            .order("order_index", { ascending: true });

          if (modulesError) {
            console.error("Erro ao buscar módulos:", modulesError);
            return course;
          }

          // Processar todas as aulas do curso
          let allLessons: any[] = [];
          
          if (modules) {
            modules.forEach(module => {
              if (module.lessons) {
                const moduleLessons = module.lessons.map(lesson => ({
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
                
                allLessons = [...allLessons, ...moduleLessons];
              }
            });
          }
          
          return {
            ...course,
            modules,
            all_lessons: allLessons
          };
        })
      );
      
      // Se o usuário não estiver autenticado, filtrar os cursos restritos
      if (!user) {
        return coursesWithModules.filter(course => !course.is_restricted);
      }

      return coursesWithModules;
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
      
      return courses.flatMap(course => course.all_lessons || []);
    }
  };
};
