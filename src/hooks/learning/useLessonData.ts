
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLessonVideo, LearningResource } from "@/lib/supabase/types";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";

interface UseLessonDataProps {
  lessonId?: string;
  courseId?: string;
}

export interface LessonModule {
  module: {
    id: string;
    title: string;
    [key: string]: any;
  };
  lessons: LearningLessonWithRelations[];
}

export function useLessonData({ lessonId, courseId }: UseLessonDataProps) {
  console.log("🔍 useLessonData iniciado:", { lessonId, courseId });
  
  // Buscar detalhes da lição - OTIMIZADO para carregamento mais rápido
  const { 
    data: lesson, 
    isLoading: isLoadingLesson,
    error: lessonError
  } = useQuery({
    queryKey: ["learning-lesson", lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from("learning_lessons")
        .select(`
          *,
          module:learning_modules(
            id,
            title,
            course_id,
            course:learning_courses(id, title, description)
          )
        `)
        .eq("id", lessonId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter no cache por 10 minutos
  });
  
  // Buscar recursos da lição
  const { 
    data: resources = [], 
    isLoading: isLoadingResources 
  } = useQuery({
    queryKey: ["learning-resources", lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });
        
      if (error) return [];
      
      // Mapear campos para garantir compatibilidade
      return (data || []).map(resource => ({
        ...resource,
        title: resource.name || resource.title // Garantir compatibilidade entre os campos name e title
      }));
    },
    enabled: !!lessonId
  });
  
  // Buscar vídeos da lição
  const { 
    data: videos = [], 
    isLoading: isLoadingVideos 
  } = useQuery({
    queryKey: ["learning-videos", lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from("learning_lesson_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });
        
      if (error) return [];
      return data || [];
    },
    enabled: !!lessonId
  });
  
  // Buscar informações do curso
  const { 
    data: courseInfo 
  } = useQuery({
    queryKey: ["learning-course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", courseId)
        .maybeSingle();
        
      if (error) return null;
      return data;
    },
    enabled: !!courseId
  });
  
  // Buscar TODAS as aulas do curso para navegação correta
  const { 
    data: allCourseLessons = [] 
  } = useQuery({
    queryKey: ["learning-course-all-lessons", courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      // Buscar todos os módulos do curso com suas aulas (todos os campos)
      const { data: modules, error: modulesError } = await supabase
        .from("learning_modules")
        .select(`
          *,
          lessons:learning_lessons(*)
        `)
        .eq("course_id", courseId)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (modulesError) {
        console.error("Erro ao buscar módulos:", modulesError);
        return [];
      }
      
      // Organizar todas as aulas do curso em ordem
      const allLessons: LearningLessonWithRelations[] = [];
      
      if (modules) {
        // Ordenar módulos por order_index
        const sortedModules = modules.sort((a, b) => a.order_index - b.order_index);
        
        sortedModules.forEach(module => {
          if (module.lessons) {
            // Filtrar apenas aulas publicadas
            const publishedLessons = module.lessons.filter(lesson => lesson.published);
            
            // Ordenar aulas dentro do módulo
            const sortedLessons = sortLessonsByNumber(publishedLessons);
            
            // Adicionar informações do módulo a cada aula
            const lessonsWithModule = sortedLessons.map(lesson => ({
              ...lesson,
              module: {
                id: module.id,
                title: module.title,
                description: module.description,
                cover_image_url: module.cover_image_url,
                course_id: module.course_id,
                order_index: module.order_index,
                published: module.published,
                created_at: module.created_at,
                updated_at: module.updated_at
              }
            }));
            
            allLessons.push(...lessonsWithModule);
          }
        });
      }
      
      console.log("Todas as aulas do curso ordenadas:", allLessons.map(l => ({
        id: l.id,
        title: l.title,
        moduleTitle: l.module?.title,
        moduleOrder: l.module?.order_index
      })));
      
      return allLessons;
    },
    enabled: !!courseId
  });
  
  // Buscar informações do módulo atual para compatibilidade
  const { 
    data: moduleData 
  } = useQuery({
    queryKey: ["learning-module-lessons", lesson?.module_id],
    queryFn: async () => {
      if (!lesson?.module_id) return null;
      
      const { data: moduleInfo, error: moduleError } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", lesson.module_id)
        .maybeSingle();
        
      if (moduleError) return null;
      
      // Usar as aulas do curso inteiro em vez de apenas do módulo
      const moduleLessons = allCourseLessons.filter(l => l.module_id === lesson.module_id);
      
      return { module: moduleInfo, lessons: moduleLessons };
    },
    enabled: !!lesson?.module_id && allCourseLessons.length > 0
  });

  return {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    allCourseLessons, // Nova propriedade com todas as aulas do curso
    isLoading: isLoadingLesson || isLoadingResources || isLoadingVideos,
    error: lessonError
  };
}
