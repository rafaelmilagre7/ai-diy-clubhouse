
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";
import { useNavigate } from "react-router-dom";

export function useCourseDetails(courseId?: string) {
  const navigate = useNavigate();
  
  // Buscar detalhes do curso
  const { 
    data: course, 
    isLoading: isLoadingCourse, 
    error: courseError 
  } = useQuery({
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
        throw new Error("Não foi possível carregar os detalhes do curso");
      }
      
      return data;
    }
  });
  
  // Buscar módulos do curso
  const { 
    data: modules, 
    isLoading: isLoadingModules 
  } = useQuery({
    queryKey: ["learning-modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("course_id", courseId)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar módulos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!course
  });
  
  // Buscar todas as aulas do curso para estatísticas
  const { 
    data: allLessons, 
    isLoading: isLoadingLessons 
  } = useQuery({
    queryKey: ["learning-course-lessons", courseId],
    queryFn: async () => {
      if (!modules?.length) return [];
      
      const moduleIds = modules.map(m => m.id);
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*, learning_lesson_videos(*)")
        .in("module_id", moduleIds)
        .eq("published", true);
        
      if (error) {
        console.error("Erro ao carregar aulas:", error);
        return [];
      }
      
      // Ordenar aulas por número no título
      return sortLessonsByNumber(data || []);
    },
    enabled: !!modules?.length
  });
  
  // Buscar progresso do usuário para este curso
  const { data: userProgress } = useQuery({
    queryKey: ["learning-progress", courseId],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("Erro ao obter usuário");
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user?.id || "");
        
      if (error) {
        console.error("Erro ao carregar progresso:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!course
  });

  // Verificar erro do curso e redirecionar se necessário
  if (courseError) {
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return { course: null, modules: [], allLessons: [], userProgress: [], isLoading: false };
  }

  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons;
  
  return {
    course,
    modules,
    allLessons,
    userProgress,
    isLoading
  };
}
