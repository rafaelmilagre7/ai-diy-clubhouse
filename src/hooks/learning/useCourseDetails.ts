
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { canAccessLearningContent, canAccessCourseEnhanced } from "@/utils/roleValidation";

export const useCourseDetails = (courseId: string | undefined) => {
  const { user } = useAuth();

  const {
    data: courseData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["course-details", courseId],
    queryFn: async () => {
      if (!courseId || !user) {
        throw new Error("Course ID and user are required");
      }

      // Não bloquear acesso à página do curso — modo freemium: UI controla o lock por aula
      console.log("🔍 Verificando acesso para usuário:", user.id);
      const hasAccess = await canAccessLearningContent(user.id);
      console.log("🎯 Resultado canAccessLearningContent:", hasAccess, "(permitindo visualização mesmo sem acesso)");

      // Verificar se há restrição de acesso específica ao curso
      const { data: accessRestriction } = await supabase
        .from("course_access_control")
        .select("id")
        .eq("course_id", courseId)
        .limit(1);

      if (accessRestriction && accessRestriction.length > 0) {
        const allowed = await canAccessCourseEnhanced(user.id, courseId);
        console.log("🔐 Restrição por curso detectada. Permitido?", allowed, "— exibindo conteúdo com bloqueio por aula se necessário");
        // Não lançar erro — deixamos a UI bloquear o acesso à aula individual
      }

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
        .eq("published", true)
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
        .eq("published", true)
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
    enabled: !!courseId && !!user,
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
