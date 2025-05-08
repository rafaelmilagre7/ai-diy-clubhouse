import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonNavigation } from "@/components/learning/member/LessonNavigation";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonSidebar } from "@/components/learning/member/LessonSidebar";
import { LessonResources } from "@/components/learning/member/LessonResources";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  // Buscar detalhes da lição
  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ["learning-lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("id", lessonId)
        .single();
        
      if (error) {
        console.error("Erro ao carregar lição:", error);
        toast.error("Não foi possível carregar a lição");
        navigate(`/learning/course/${courseId}`);
        throw new Error("Não foi possível carregar a lição");
      }
      
      return data;
    }
  });
  
  // Buscar recursos da lição
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["learning-resources", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar recursos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!lessonId
  });
  
  // Buscar vídeos da lição
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["learning-videos", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_lesson_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });
        
      if (error) {
        console.error("Erro ao carregar vídeos:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!lessonId
  });
  
  // Buscar informações do módulo para navegação
  const { data: moduleData } = useQuery({
    queryKey: ["learning-module-lessons", lesson?.module_id],
    queryFn: async () => {
      if (!lesson?.module_id) return null;
      
      const { data: moduleInfo, error: moduleError } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", lesson.module_id)
        .single();
        
      if (moduleError) {
        console.error("Erro ao carregar módulo:", moduleError);
        return null;
      }
      
      const { data: moduleLessons, error: lessonsError } = await supabase
        .from("learning_lessons")
        .select("*")
        .eq("module_id", lesson.module_id)
        .eq("published", true)
        .order("order_index", { ascending: true });
        
      if (lessonsError) {
        console.error("Erro ao carregar aulas do módulo:", lessonsError);
        return { module: moduleInfo, lessons: [] };
      }
      
      return { module: moduleInfo, lessons: moduleLessons };
    },
    enabled: !!lesson
  });
  
  // Buscar progresso atual da lição
  const { data: userProgress, refetch: refetchProgress } = useQuery({
    queryKey: ["learning-lesson-progress", lessonId],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
        
      if (error) {
        console.error("Erro ao carregar progresso da lição:", error);
        return null;
      }
      
      if (data) {
        setProgress(data.progress_percentage);
      }
      
      return data;
    },
    enabled: !!lessonId
  });
  
  // Salvar progresso da lição
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const timestamp = new Date().toISOString();
      
      if (userProgress) {
        // Atualizar progresso existente
        const { error } = await supabase
          .from("learning_progress")
          .update({ 
            progress_percentage: newProgress,
            last_position_seconds: 0, // Este valor seria atualizado no player de vídeo
            updated_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : userProgress.completed_at
          })
          .eq("id", userProgress.id);
          
        if (error) throw error;
      } else {
        // Criar novo registro de progresso
        const { error } = await supabase
          .from("learning_progress")
          .insert({
            user_id: userData.user.id,
            lesson_id: lessonId,
            progress_percentage: newProgress,
            started_at: timestamp,
            completed_at: newProgress >= 100 ? timestamp : null
          });
          
        if (error) throw error;
      }
      
      return newProgress;
    },
    onSuccess: () => {
      refetchProgress();
    },
    onError: (error) => {
      console.error("Erro ao salvar progresso:", error);
      toast.error("Não foi possível salvar seu progresso");
    }
  });
  
  // Atualizar progresso quando o usuário interage com a lição
  const handleProgressUpdate = (videoId: string, newProgress: number) => {
    // Se o progresso for maior que o atual, atualizamos
    if (newProgress > progress) {
      setProgress(newProgress);
      updateProgressMutation.mutate(newProgress);
    }
  };
  
  // Marcar lição como concluída
  const handleComplete = async (): Promise<void> => {
    await updateProgressMutation.mutateAsync(100);
    toast.success("Lição concluída com sucesso!");
  };
  
  // Marcar o início do estudo quando a página carrega
  useEffect(() => {
    if (lessonId && !userProgress) {
      updateProgressMutation.mutate(1);
    }
  }, [lessonId, userProgress]);

  const isLoading = isLoadingLesson || isLoadingResources || isLoadingVideos;
  
  if (isLoading) {
    return <div className="container py-8">Carregando conteúdo da aula...</div>;
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(`/learning/course/${courseId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para o curso
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <LessonHeader 
            title={lesson?.title || ""} 
            moduleTitle={moduleData?.module?.title || ""}
            progress={progress}
          />
          
          <div className="mt-6">
            <LessonNavigation 
              courseId={courseId!}
              currentLesson={lesson!}
              allLessons={moduleData?.lessons || []}
              onComplete={handleComplete}
              isCompleted={progress >= 100}
            />
          </div>
          
          <div className="mt-8">
            <LessonContent 
              lesson={lesson!} 
              videos={videos || []} 
              onProgressUpdate={handleProgressUpdate} 
            />
          </div>
          
          {(resources && resources.length > 0) && (
            <div className="mt-8">
              <LessonResources resources={resources} />
            </div>
          )}
        </div>
        
        <div>
          <LessonSidebar 
            currentLesson={lesson!}
            module={moduleData?.module}
            lessons={moduleData?.lessons || []}
            courseId={courseId!}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
