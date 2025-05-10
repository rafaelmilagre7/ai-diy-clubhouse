
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LearningLesson, LearningLessonVideo, LearningResource } from "@/lib/supabase";
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
  lessons: LearningLesson[];
}

export function useLessonData({ lessonId, courseId }: UseLessonDataProps) {
  // Buscar detalhes da lição
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
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId
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
  
  // Buscar informações do módulo para navegação
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
      
      const { data: moduleLessons, error: lessonsError } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("module_id", lesson.module_id)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (lessonsError) {
        return { module: moduleInfo, lessons: [] };
      }
      
      // Ordenar lições por número no título para garantir navegação correta
      const sortedLessons = sortLessonsByNumber(moduleLessons || []);
      
      return { module: moduleInfo, lessons: sortedLessons };
    },
    enabled: !!lesson?.module_id
  });

  return {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    isLoading: isLoadingLesson || isLoadingResources || isLoadingVideos,
    error: lessonError
  };
}
