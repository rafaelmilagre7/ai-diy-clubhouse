
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useCourseAccess } from "./useCourseAccess";
import { toast } from "sonner";

export const useCourseDetails = (courseId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkCourseAccess } = useCourseAccess();
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔍 Carregando dados do curso:", courseId);

        // 1. Verificar acesso ao curso
        const hasAccess = await checkCourseAccess(courseId, user.id);
        console.log("🔐 Resultado verificação de acesso:", hasAccess);

        if (!hasAccess) {
          console.log("❌ Acesso negado ao curso");
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // 2. Buscar dados do curso
        const { data: courseData, error: courseError } = await supabase
          .from("learning_courses")
          .select("*")
          .eq("id", courseId as any)
          .eq("published", true as any)
          .single();

        if (courseError) {
          console.error("❌ Erro ao carregar curso:", courseError);
          if (courseError.code === 'PGRST116') {
            console.log("Course not found, redirecting to courses list");
            toast.error("Curso não encontrado");
            navigate("/learning");
            return;
          }
          throw courseError;
        }

        if (!courseData || !(courseData as any).title) {
          console.log("Course not found or not published, redirecting to courses list");
          toast.error("Curso não encontrado ou não publicado");
          navigate("/learning");
          return;
        }

        setCourse(courseData);
        console.log("✅ Curso carregado:", (courseData as any).title);

        // 3. Buscar módulos do curso
        const { data: modulesData, error: modulesError } = await supabase
          .from("learning_modules")
          .select("*")
          .eq("course_id", courseId as any)
          .eq("published", true as any)
          .order("order_index", { ascending: true });

        if (modulesError) {
          console.error("❌ Erro ao carregar módulos:", modulesError);
          throw modulesError;
        }

        const processedModules = (modulesData || []).map((module: any) => ({
          id: (module as any).id,
          title: (module as any).title,
          published: (module as any).published,
          order_index: (module as any).order_index,
          course_id: courseId
        }));

        setModules(processedModules);
        console.log("✅ Módulos carregados:", processedModules.length);

        // 4. Buscar todas as aulas dos módulos
        if (processedModules.length > 0) {
          const moduleIds = processedModules.map((m: any) => (m as any).id);
          
          const { data: lessonsData, error: lessonsError } = await supabase
            .from("learning_lessons")
            .select("*")
            .in("module_id", moduleIds)
            .eq("published", true as any)
            .order("order_index", { ascending: true });

          if (lessonsError) {
            console.error("❌ Erro ao carregar aulas:", lessonsError);
            throw lessonsError;
          }

          const processedLessons = (lessonsData || []).map((lesson: any) => ({
            id: (lesson as any).id,
            title: (lesson as any).title,
            module_id: (lesson as any).module_id,
            order_index: (lesson as any).order_index,
            published: (lesson as any).published
          }));

          setAllLessons(processedLessons);
          console.log("✅ Aulas carregadas:", processedLessons.length);

          // 5. Buscar progresso do usuário
          if (processedLessons.length > 0) {
            const lessonIds = processedLessons.map((l: any) => (l as any).id);
            
            const { data: progressData, error: progressError } = await supabase
              .from("learning_progress")
              .select("*")
              .eq("user_id", user.id as any)
              .in("lesson_id", lessonIds);

            if (progressError) {
              console.error("❌ Erro ao carregar progresso:", progressError);
            } else {
              setUserProgress(progressData || []);
              console.log("✅ Progresso carregado:", (progressData || []).length);
            }
          }
        }

      } catch (error) {
        console.error("❌ Erro ao carregar dados do curso:", error);
        toast.error("Erro ao carregar dados do curso");
        navigate("/learning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, navigate, checkCourseAccess]);

  return {
    course,
    modules,
    allLessons,
    userProgress,
    isLoading,
    accessDenied
  };
};
