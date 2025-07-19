
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const useCourseDetails = (courseId: string | undefined) => {
  const { user, profile } = useAuth();

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

      // Log para debug - verificar role do usuário
      console.log("🔍 Verificando acesso ao curso:", {
        userId: user?.id,
        userEmail: user?.email,
        profileRole: profile?.role,
        courseId
      });

      // Verificar se o usuário tem permissão para acessar cursos
      const isAdmin = profile?.role === 'admin';
      const isMembroClub = profile?.role === 'membro_club';
      const isFormacao = profile?.role === 'formacao';
      
      if (!isAdmin && !isMembroClub && !isFormacao) {
        console.log("❌ Acesso negado - Role insuficiente:", profile?.role);
        throw new Error("Acesso negado - Role insuficiente");
      }

      console.log("✅ Acesso permitido para role:", profile?.role);

      // Buscar dados do curso
      const { data: course, error: courseError } = await supabase
        .from("learning_courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) {
        console.error("❌ Erro ao buscar curso:", courseError);
        throw new Error("Curso não encontrado");
      }

      console.log("✅ Curso encontrado:", course?.title);

      // Buscar módulos do curso
      const { data: modules, error: modulesError } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) {
        console.error("⚠️ Erro ao buscar módulos:", modulesError);
      }

      console.log("📚 Módulos encontrados:", modules?.length || 0);

      // Buscar todas as aulas do curso
      const { data: allLessons, error: lessonsError } = await supabase
        .from("learning_lessons")
        .select("*")
        .in("module_id", (modules || []).map(m => m.id))
        .order("order_index");

      if (lessonsError) {
        console.error("⚠️ Erro ao buscar aulas:", lessonsError);
      }

      console.log("🎓 Aulas encontradas:", allLessons?.length || 0);

      // Buscar progresso do usuário
      let userProgress = [];
      if (user) {
        const { data: progressData } = await supabase
          .from("learning_progress")
          .select("*")
          .eq("user_id", user.id);
        
        userProgress = progressData || [];
      }

      console.log("📊 Progresso do usuário:", userProgress.length, "registros");

      return {
        course,
        modules: modules || [],
        allLessons: allLessons || [],
        userProgress
      };
    },
    enabled: !!courseId && !!user && !!profile,
    retry: 1
  });

  return {
    course: courseData?.course,
    modules: courseData?.modules || [],
    allLessons: courseData?.allLessons || [],
    userProgress: courseData?.userProgress || [],
    isLoading,
    error
  };
};
