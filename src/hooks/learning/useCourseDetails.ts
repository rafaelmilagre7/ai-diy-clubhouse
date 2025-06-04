
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
  
  // Verificar acesso ao curso - com fallback para permitir acesso se houver erro
  const { 
    data: hasAccess,
    isLoading: isCheckingAccess,
    isError: isAccessError
  } = useQuery({
    queryKey: ["learning-course-access", user?.id, courseId],
    queryFn: async () => {
      if (!courseId || !user?.id) return true; // Se não tiver curso ou usuário, permitir acesso
      
      try {
        const result = await checkCourseAccess(courseId, user.id);
        console.log(`Verificação de acesso ao curso ${courseId} para usuário ${user.id}:`, result);
        return result;
      } catch (error) {
        console.error("Erro na verificação de acesso ao curso:", error);
        // Se houver erro na verificação, permitir acesso para evitar bloqueios
        return true;
      }
    },
    enabled: !!user?.id && !!courseId,
    // Em caso de erro, permitir acesso
    retry: 1,
    onError: (error) => {
      console.error("Erro na query de verificação de acesso:", error);
    }
  });
  
  // Buscar detalhes do curso - sempre buscar se não há negação explícita de acesso
  const { 
    data: course, 
    isLoading: isLoadingCourse, 
    error: courseError 
  } = useQuery({
    queryKey: ["learning-course", courseId],
    queryFn: async () => {
      console.log(`Carregando curso ${courseId}...`);
      
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
      
      console.log(`Curso ${courseId} carregado:`, data?.title);
      return data;
    },
    enabled: !!courseId && hasAccess !== false && !accessDenied
  });
  
  // Buscar módulos do curso - sempre buscar se temos o curso
  const { 
    data: modules, 
    isLoading: isLoadingModules 
  } = useQuery({
    queryKey: ["learning-modules", courseId],
    queryFn: async () => {
      console.log(`Carregando módulos do curso ${courseId}...`);
      
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
      
      console.log(`${data?.length || 0} módulos carregados para o curso ${courseId}:`, 
        data?.map(m => ({ id: m.id, title: m.title })) || []);
      
      return data;
    },
    enabled: !!course && hasAccess !== false && !accessDenied
  });
  
  // Buscar todas as aulas do curso para estatísticas
  const { 
    data: allLessons, 
    isLoading: isLoadingLessons 
  } = useQuery({
    queryKey: ["learning-course-lessons", courseId],
    queryFn: async () => {
      if (!modules?.length) {
        console.log("Nenhum módulo encontrado para carregar aulas");
        return [];
      }
      
      const moduleIds = modules.map(m => m.id);
      console.log(`Carregando aulas dos módulos: ${moduleIds.join(", ")}`);
      
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*, learning_lesson_videos(*)")
        .in("module_id", moduleIds)
        .eq("published", true);
        
      if (error) {
        console.error("Erro ao carregar aulas:", error);
        return [];
      }
      
      const sortedLessons = sortLessonsByNumber(data || []);
      console.log(`${sortedLessons.length} aulas carregadas para o curso ${courseId}:`,
        sortedLessons.map(l => ({ id: l.id, title: l.title })));
      
      return sortedLessons;
    },
    enabled: !!modules?.length && hasAccess !== false && !accessDenied
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
      
      console.log(`Progresso carregado para o usuário: ${data?.length || 0} entradas`);
      return data;
    },
    enabled: !!course && hasAccess !== false && !accessDenied
  });

  // Verificar erro do curso e redirecionar se necessário
  if (courseError) {
    console.error("Erro no curso - redirecionando:", courseError);
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return { course: null, modules: [], allLessons: [], userProgress: [], isLoading: false, accessDenied: false };
  }
  
  // Verificar acesso negado apenas se a verificação foi bem-sucedida e retornou false
  if (hasAccess === false && !accessDenied && !isCheckingAccess && !isAccessError) {
    console.log("Acesso negado ao curso:", courseId);
    setAccessDenied(true);
    toast.error("Você não tem acesso a este curso");
  }

  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons || isCheckingAccess;
  
  console.log("Estado do useCourseDetails:", {
    courseId,
    hasAccess,
    accessDenied,
    isCheckingAccess,
    isAccessError,
    courseLoaded: !!course,
    modulesCount: modules?.length || 0,
    lessonsCount: allLessons?.length || 0,
    isLoading
  });
  
  return {
    course,
    modules,
    allLessons,
    userProgress,
    isLoading,
    accessDenied: hasAccess === false || accessDenied
  };
}
