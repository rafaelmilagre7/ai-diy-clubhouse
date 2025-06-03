
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useLessonDetails(lessonId?: string, courseId?: string) {
  const { data: lesson, isLoading: isLoadingLesson, error } = useQuery({
    queryKey: ["learning-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("id", lessonId)
        .eq("published", true)
        .single();
        
      if (error) {
        console.error("Erro ao carregar aula:", error);
        throw new Error("Não foi possível carregar a aula");
      }
      
      return data;
    },
    enabled: !!lessonId
  });

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["learning-course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", courseId)
        .eq("published", true)
        .single();
        
      if (error) {
        console.error("Erro ao carregar curso:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!courseId
  });

  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["learning-lesson-videos", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lesson_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index");
        
      if (error) {
        console.error("Erro ao carregar vídeos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!lessonId
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["learning-lesson-resources", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("lesson_id", lessonId);
        
      if (error) {
        console.error("Erro ao carregar recursos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!lessonId
  });

  return {
    lesson,
    course,
    videos,
    resources,
    isLoading: isLoadingLesson || isLoadingCourse || isLoadingVideos || isLoadingResources,
    error
  };
}
