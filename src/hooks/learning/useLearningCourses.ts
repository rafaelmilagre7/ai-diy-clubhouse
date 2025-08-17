
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson, LearningModule } from "@/lib/supabase/types";
import { LearningCourseWithStats } from "@/lib/supabase/types/extended";
import { useAuth } from "@/contexts/auth";
import { devLog, devWarn } from "@/hooks/useOptimizedLogging";

export const useLearningCourses = () => {
  const { user, profile } = useAuth();
  

  const {
    data: courses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["learning-courses", user?.id, profile?.role],
    queryFn: async () => {
      devLog('[COURSES] Iniciando busca de cursos...', {
        userId: user?.id,
        userEmail: user?.email,
        profileRole: profile?.role,
        isAdmin: profile?.role === 'admin'
      });

      try {
        // Estratégia 1: Tentar usar a função SQL get_learning_courses_with_stats
        devLog('[COURSES] Tentativa 1: Usando função SQL');
        const { data: sqlData, error: sqlError } = await supabase.rpc('get_learning_courses_with_stats');

        if (sqlError) {
          devWarn('[COURSES] Função SQL falhou:', sqlError.message);
          
          // Estratégia 2: Buscar diretamente das tabelas
          devLog('[COURSES] Tentativa 2: Busca direta das tabelas');
          const { data: directData, error: directError } = await supabase
            .from("learning_courses")
            .select(`
              *,
              learning_modules(count)
            `)
            .eq("published", true)
            .order("order_index", { ascending: true });

          if (directError) {
            devWarn('[COURSES] Busca direta também falhou:', directError.message);
            throw directError;
          }

          // Processar dados da busca direta
          const processedCourses = directData?.map(course => ({
            ...course,
            module_count: course.learning_modules?.length || 0,
            lesson_count: 0, // Será calculado depois
            is_restricted: false // Assumir que não é restrito se não conseguimos verificar
          })) || [];

          devLog('[COURSES] Busca direta bem-sucedida:', {
            coursesFound: processedCourses.length,
            courses: processedCourses.map(c => ({ id: c.id, title: c.title }))
          });

          return processedCourses;
        }

        devLog('[COURSES] Função SQL bem-sucedida:', {
          coursesFound: sqlData?.length || 0,
          courses: sqlData?.map(c => ({ id: c.id, title: c.title, is_restricted: c.is_restricted }))
        });

        // Processar dados da função SQL
        if (!sqlData || sqlData.length === 0) {
          devWarn('[COURSES] Nenhum curso retornado pela função SQL');
          return [];
        }

        // Filtrar cursos únicos por ID
        const uniqueCourses = sqlData.reduce((acc: LearningCourseWithStats[], current: LearningCourseWithStats) => {
          const exists = acc.find(course => course.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        devLog('[COURSES] Cursos únicos encontrados:', uniqueCourses.length);

        // Buscar módulos e aulas para cada curso
        const coursesWithModules = await Promise.all(
          uniqueCourses.map(async (course: LearningCourseWithStats) => {
            try {
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
                devWarn(`[COURSES] Erro ao buscar módulos para curso ${course.title}:`, modulesError.message);
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
            } catch (moduleError) {
              devWarn(`[COURSES] Erro ao processar módulos para curso ${course.title}:`, moduleError);
              return course;
            }
          })
        );
        
        // CORREÇÃO SEGURA: Usar apenas role do banco (RLS) como fonte única de verdade
        const isAdmin = profile?.user_roles?.name === 'admin';
        
        let finalCourses = coursesWithModules;
        
        // Se NÃO for admin e NÃO estiver autenticado, filtrar cursos restritos
        if (!isAdmin && !user) {
          const restrictedCount = finalCourses.filter(course => course.is_restricted).length;
          finalCourses = finalCourses.filter(course => !course.is_restricted);
          
          devLog('[COURSES] Usuário não autenticado - filtrando cursos restritos:', {
            totalCourses: coursesWithModules.length,
            restrictedFiltered: restrictedCount,
            remainingCourses: finalCourses.length
          });
        } else {
          devLog('[COURSES] Admin ou usuário autenticado - mostrando todos os cursos:', {
            isAdmin,
            userEmail: user?.email,
            totalCourses: finalCourses.length
          });
        }

        devLog('[COURSES] Cursos finais a serem retornados:', {
          count: finalCourses.length,
          courses: finalCourses.map(c => ({ 
            id: c.id, 
            title: c.title, 
            is_restricted: c.is_restricted,
            modules: c.modules?.length || 0
          }))
        });

        return finalCourses;

      } catch (error) {
        devWarn('[COURSES] Erro geral na busca de cursos:', error);
        
        // Estratégia 3: Busca mínima de emergência
        try {
          devLog('[COURSES] Tentativa de emergência: busca mínima');
          const { data: emergencyData, error: emergencyError } = await supabase
            .from("learning_courses")
            .select("*")
            .eq("published", true)
            .order("order_index", { ascending: true });

          if (emergencyError) {
            devWarn('[COURSES] Busca de emergência falhou:', emergencyError.message);
            throw emergencyError;
          }

          devLog('[COURSES] Busca de emergência bem-sucedida:', {
            coursesFound: emergencyData?.length || 0
          });

          return emergencyData?.map(course => ({
            ...course,
            module_count: 0,
            lesson_count: 0,
            is_restricted: false,
            modules: [],
            all_lessons: []
          })) || [];

        } catch (emergencyError) {
          devWarn('[COURSES] Todas as estratégias falharam:', emergencyError);
          throw emergencyError;
        }
      }
    },
    enabled: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10 * 60 * 1000, // 10 minutos (aumentado)
    refetchOnWindowFocus: false
  });

  // Log do resultado final
  devLog('[COURSES] Hook resultado final:', {
    isLoading,
    error: error?.message,
    coursesCount: courses?.length || 0,
    courses: courses?.map(c => ({ id: c.id, title: c.title }))
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
