
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const useCourseDetails = (courseId: string | undefined) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const {
    data: courseData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["course-details", courseId],
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }

      // Para admin e membro_club, permitir acesso a todos os cursos
      const isAdmin = profile?.role === 'admin' || user?.email?.includes('@viverdeia.ai');
      const isMember = profile?.role === 'membro_club' || profile?.role === 'member';
      
      if (!isAdmin && !isMember) {
        throw new Error("Acesso negado - Role insuficiente");
      }

      // Buscar dados do curso
      const { data: course, error: courseError } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("Erro ao buscar curso:", courseError);
        throw new Error("Curso não encontrado");
      }

      // Buscar módulos do curso
      const { data: modules, error: modulesError } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) {
        console.error("Erro ao buscar módulos:", modulesError);
        // Não falhar se não tiver módulos, apenas retornar array vazio
      }

      // Buscar todas as aulas do curso
      const { data: allLessons, error: lessonsError } = await supabase
        .from("learning_lessons")
        .select("*")
        .in("module_id", (modules || []).map(m => m.id))
        .order("order_index");

      if (lessonsError) {
        console.error("Erro ao buscar aulas:", lessonsError);
        // Não falhar se não tiver aulas, apenas retornar array vazio
      }

      // Buscar progresso do usuário
      let userProgress = [];
      if (user) {
        const { data: progressData } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", user.id);
        
        userProgress = progressData || [];
      }

      return {
        course,
        modules: modules || [],
        allLessons: allLessons || [],
        userProgress
      };
    },
    enabled: !!courseId && !!user,
    retry: 1
  });

  // Redirecionar apenas se realmente não encontrou o curso após carregar
  useEffect(() => {
    if (!isLoading && error && courseId) {
      console.log("Erro ao carregar curso:", error.message);
      // Aguardar um pouco antes de redirecionar para dar chance ao usuário ver o erro
      const timer = setTimeout(() => {
        navigate("/learning");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, isLoading, courseId, navigate]);

  return {
    course: courseData?.course,
    modules: courseData?.modules || [],
    allLessons: courseData?.allLessons || [],
    userProgress: courseData?.userProgress || [],
    isLoading,
    accessDenied: false, // Simplificado - se chegou até aqui, tem acesso
    error
  };
};
