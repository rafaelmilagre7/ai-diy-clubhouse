
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";
import { useNavigate } from "react-router-dom";
import { useCourseAccess } from "./useCourseAccess";
import { useAuth } from "@/contexts/auth";

export function useCourseDetails(courseId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCourseAccess } = useCourseAccess();
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Verificar acesso ao curso
  const { 
    data: hasAccess,
    isLoading: isCheckingAccess,
    isError: isAccessError
  } = useQuery({
    queryKey: ["learning-course-access", user?.id, courseId],
    queryFn: async () => {
      if (!courseId || !user?.id) return true;
      const result = await checkCourseAccess(courseId, user.id);
      return result;
    },
    enabled: !!user?.id && !!courseId
  });
  
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
    },
    enabled: !!courseId && (hasAccess === true) && !accessDenied
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
      
      console.log(`Módulos carregados para curso ${courseId}:`, data?.length || 0);
      return data;
    },
    enabled: !!course && (hasAccess === true) && !accessDenied
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
      const sortedLessons = sortLessonsByNumber(data || []);
      console.log(`Aulas carregadas para curso ${courseId}:`, sortedLessons.length);
      return sortedLessons;
    },
    enabled: !!modules?.length && (hasAccess === true) && !accessDenied
  });
  
  // Buscar progresso do usuário - CORRIGIDO para filtrar apenas aulas do curso atual
  const { data: userProgress } = useQuery({
    queryKey: ["learning-progress", courseId, user?.id],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error("Erro ao obter usuário");
      
      if (!allLessons?.length) {
        console.log("Nenhuma aula encontrada para buscar progresso");
        return [];
      }
      
      // Buscar apenas progresso das aulas deste curso específico
      const lessonIds = allLessons.map(lesson => lesson.id);
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user?.id || "")
        .in("lesson_id", lessonIds); // FILTRO ADICIONADO: apenas aulas deste curso
        
      if (error) {
        console.error("Erro ao carregar progresso:", error);
        return [];
      }
      
      console.log(`Progresso carregado para curso ${courseId}:`, {
        totalAulas: lessonIds.length,
        progressoEncontrado: data?.length || 0,
        aulasComProgresso: data?.map(p => p.lesson_id) || []
      });
      
      return data;
    },
    enabled: !!course && !!allLessons?.length && (hasAccess === true) && !accessDenied
  });

  // Verificar erro do curso e redirecionar se necessário
  if (courseError) {
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return { course: null, modules: [], allLessons: [], userProgress: [], isLoading: false, accessDenied: false };
  }
  
  // Verificar acesso negado
  if (hasAccess === false && !accessDenied && !isCheckingAccess) {
    setAccessDenied(true);
    toast.error("Você não tem acesso a este curso");
  }

  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons || isCheckingAccess;
  
  return {
    course,
    modules,
    allLessons,
    userProgress,
    isLoading,
    accessDenied: hasAccess === false || accessDenied
  };
}
