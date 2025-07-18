import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";
import { convertToLearningLessonsWithRelations } from "@/lib/supabase/utils/typeConverters";
import { useNavigate } from "react-router-dom";
import { useCourseAccess } from "./useCourseAccess";
import { useAuth } from "@/contexts/auth";

export function useCourseDetails(courseId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCourseAccess } = useCourseAccess();
  const [accessDenied, setAccessDenied] = useState(false);
  
  console.log("🔍 useCourseDetails iniciado com courseId:", courseId);
  
  // Verificação de acesso simplificada
  const { 
    data: hasAccess,
    isLoading: isCheckingAccess,
    isError: isAccessError
  } = useQuery({
    queryKey: ["learning-course-access", courseId],
    queryFn: async () => {
      if (!courseId) {
        console.log("❌ Sem courseId para verificar acesso");
        return false;
      }
      
      if (!user?.id) {
        console.log("❌ Usuário não autenticado");
        return false;
      }
      
      console.log(`🔍 Verificando acesso ao curso ${courseId} para usuário ${user.id}`);
      
      try {
        const result = await checkCourseAccess(courseId, user.id);
        console.log(`✅ Resultado verificação de acesso:`, result);
        return result;
      } catch (error) {
        console.error("❌ Erro na verificação de acesso:", error);
        // Em caso de erro, negar acesso por segurança
        return false;
      }
    },
    enabled: !!courseId && !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });
  
  // Buscar detalhes do curso
  const { 
    data: course, 
    isLoading: isLoadingCourse, 
    error: courseError 
  } = useQuery({
    queryKey: ["learning-course", courseId],
    queryFn: async () => {
      console.log(`📚 Carregando curso ${courseId}...`);
      
      const { data, error } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", courseId)
        .eq("published", true)
        .maybeSingle();
        
      if (error) {
        console.error("❌ Erro ao carregar curso:", error);
        throw new Error("Não foi possível carregar os detalhes do curso");
      }
      
      if (!data) {
        console.error("❌ Curso não encontrado:", courseId);
        throw new Error("Curso não encontrado");
      }
      
      console.log(`✅ Curso carregado:`, data.title);
      return data;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });
  
  // Buscar módulos do curso
  const { 
    data: modules, 
    isLoading: isLoadingModules 
  } = useQuery({
    queryKey: ["learning-modules", courseId],
    queryFn: async () => {
      console.log(`📋 Carregando módulos do curso ${courseId}...`);
      
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("course_id", courseId)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("❌ Erro ao carregar módulos:", error);
        return [];
      }
      
      console.log(`✅ ${data?.length || 0} módulos carregados:`, 
        data?.map(m => ({ id: m.id, title: m.title })) || []);
      
      return data || [];
    },
    enabled: !!course && !!courseId
  });
  
  // Buscar todas as aulas do curso
  const { 
    data: allLessons, 
    isLoading: isLoadingLessons 
  } = useQuery({
    queryKey: ["learning-course-lessons", courseId],
    queryFn: async () => {
      if (!modules?.length) {
        console.log("🔍 Nenhum módulo encontrado para carregar aulas");
        return [];
      }
      
      const moduleIds = modules.map(m => m.id);
      console.log(`📖 Carregando aulas dos módulos:`, moduleIds);
      
      const { data: allLessonsData, error } = await supabase
        .from("learning_lessons")
        .select("*, learning_lesson_videos(*)")
        .in("module_id", moduleIds)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("❌ Erro ao carregar aulas:", error);
        return [];
      }
      
      console.log(`✅ ${allLessonsData?.length || 0} aulas carregadas`);
      
      // Converter para LearningLessonWithRelations
      const convertedLessons = convertToLearningLessonsWithRelations(allLessonsData || []);
      return convertedLessons;
    },
    enabled: !!modules?.length && !!courseId
  });
  
  // Buscar progresso do usuário para este curso
  const { data: userProgress } = useQuery({
    queryKey: ["learning-progress", courseId, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("🔍 Usuário não autenticado - sem progresso");
        return [];
      }
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("❌ Erro ao carregar progresso:", error);
        return [];
      }
      
      console.log(`✅ Progresso carregado: ${data?.length || 0} entradas`);
      return data || [];
    },
    enabled: !!course && !!user?.id
  });

  // Lidar com erros
  if (courseError) {
    console.error("❌ Erro no curso - redirecionando:", courseError);
    toast.error("Curso não encontrado ou indisponível");
    navigate("/learning");
    return { course: null, modules: [], allLessons: [], userProgress: [], isLoading: false, accessDenied: false };
  }
  
  // Verificar acesso
  const shouldDenyAccess = hasAccess === false && !isCheckingAccess && !isAccessError;
  if (shouldDenyAccess && !accessDenied) {
    console.log("❌ Acesso negado ao curso:", courseId);
    setAccessDenied(true);
    toast.error("Você não tem acesso a este curso");
  }

  const isLoading = isLoadingCourse || isLoadingModules || isLoadingLessons || isCheckingAccess;
  
  console.log("📊 Estado final useCourseDetails:", {
    courseId,
    hasAccess,
    accessDenied: shouldDenyAccess || accessDenied,
    isCheckingAccess,
    isAccessError,
    courseLoaded: !!course,
    modulesCount: modules?.length || 0,
    lessonsCount: allLessons?.length || 0,
    isLoading
  });
  
  return {
    course,
    modules: modules || [],
    allLessons: allLessons || [],
    userProgress: userProgress || [],
    isLoading,
    accessDenied: shouldDenyAccess || accessDenied
  };
}
