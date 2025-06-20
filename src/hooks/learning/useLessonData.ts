
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { LearningLesson } from "@/types/learningTypes";

interface UseLessonDataProps {
  lessonId?: string;
  courseId?: string;
}

export const useLessonData = ({ lessonId, courseId }: UseLessonDataProps) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<LearningLesson | null>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [allCourseLessons, setAllCourseLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("🔍 Carregando dados da aula:", lessonId);

        // 1. Buscar dados da aula
        const { data: lessonData, error: lessonError } = await supabase
          .from("learning_lessons")
          .select("*")
          .eq("id", lessonId as any)
          .eq("published", true as any)
          .single();

        if (lessonError) {
          console.error("❌ Erro ao carregar aula:", lessonError);
          throw new Error("Aula não encontrada");
        }

        setLesson(lessonData as any);
        console.log("✅ Aula carregada:", (lessonData as any)?.title);

        // 2. Buscar dados do módulo
        const { data: moduleInfo, error: moduleError } = await supabase
          .from("learning_modules")
          .select(`
            *,
            course:learning_courses(*)
          `)
          .eq("id", (lessonData as any).module_id as any)
          .single();

        if (moduleError) {
          console.error("❌ Erro ao carregar módulo:", moduleError);
        } else {
          setModuleData({
            module: moduleInfo,
            course: (moduleInfo as any).course
          });
          setCourseInfo((moduleInfo as any).course);
          console.log("✅ Módulo carregado:", (moduleInfo as any)?.title);
        }

        // 3. Buscar recursos da aula
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("learning_resources")
          .select("*")
          .eq("lesson_id", lessonId as any)
          .order("order_index", { ascending: true });

        if (resourcesError) {
          console.error("❌ Erro ao carregar recursos:", resourcesError);
        } else {
          setResources(resourcesData || []);
          console.log("✅ Recursos carregados:", (resourcesData || []).length);
        }

        // 4. Buscar vídeos da aula
        const { data: videosData, error: videosError } = await supabase
          .from("learning_lesson_videos")
          .select("*")
          .eq("lesson_id", lessonId as any)
          .order("order_index", { ascending: true });

        if (videosError) {
          console.error("❌ Erro ao carregar vídeos:", videosError);
        } else {
          setVideos(videosData || []);
          console.log("✅ Vídeos carregados:", (videosData || []).length);
        }

        // 5. Se temos courseId, buscar todas as aulas do curso
        if (courseId) {
          const { data: allLessonsData, error: allLessonsError } = await supabase
            .from("learning_lessons")
            .select(`
              id,
              title,
              order_index,
              module_id,
              learning_modules!inner(
                id,
                title,
                order_index,
                course_id
              )
            `)
            .eq("learning_modules.course_id", courseId as any)
            .eq("published", true as any)
            .order("learning_modules.order_index", { ascending: true })
            .order("order_index", { ascending: true });

          if (allLessonsError) {
            console.error("❌ Erro ao carregar todas as aulas:", allLessonsError);
          } else {
            setAllCourseLessons(allLessonsData || []);
            console.log("✅ Todas as aulas carregadas:", (allLessonsData || []).length);
          }
        }

      } catch (err) {
        console.error("❌ Erro geral ao carregar dados da aula:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, courseId, user]);

  return {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    allCourseLessons,
    isLoading,
    error
  };
};
