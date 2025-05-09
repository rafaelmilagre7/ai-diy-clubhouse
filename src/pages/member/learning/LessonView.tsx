
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonNavigation } from "@/components/learning/member/LessonNavigation";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonSidebar } from "@/components/learning/member/LessonSidebar";
import { useLessonData } from "@/hooks/learning/useLessonData";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";
import { useLessonProgress } from "@/hooks/learning/useLessonProgress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  
  // Buscar dados da lição usando hooks personalizados
  const {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    isLoading,
    error
  } = useLessonData({ 
    lessonId, 
    courseId 
  });
  
  // Garantir que temos arrays válidos
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeModuleLessons = moduleData?.lessons ? 
    (Array.isArray(moduleData.lessons) ? moduleData.lessons : []) : [];
  
  // Gerenciar navegação entre lições
  const {
    prevLesson,
    nextLesson,
    navigateToCourse
  } = useLessonNavigation({
    courseId,
    currentLessonId: lessonId,
    lessons: safeModuleLessons
  });
  
  // Gerenciar progresso da lição
  const {
    progress,
    updateProgress,
    completeLesson
  } = useLessonProgress({ lessonId });
  
  // Buscar lições completadas para o sidebar
  const { data: completedLessonsData = [] } = useQuery({
    queryKey: ["learning-completed-lessons", moduleData?.module?.id],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !moduleData?.module?.id) return [];
      
      const { data, error } = await supabase
        .from("learning_progress")
        .select("lesson_id")
        .eq("user_id", userData.user.id)
        .gte("progress_percentage", 100);
        
      if (error) {
        console.error("Erro ao carregar aulas concluídas:", error);
        return [];
      }
      
      if (!data || !Array.isArray(data)) return [];
      
      return data.map(item => item.lesson_id);
    },
    enabled: !!moduleData?.module?.id
  });
  
  // Garantir que completedLessons é sempre um array
  const completedLessons = Array.isArray(completedLessonsData) ? completedLessonsData : [];

  // Atualizar progresso quando o usuário interage com a lição
  const handleProgressUpdate = (videoId: string, newProgress: number) => {
    updateProgress(newProgress);
  };

  if (isLoading) {
    return <div className="container py-8">Carregando conteúdo da aula...</div>;
  }
  
  // Se não tiver a lição, mostrar erro
  if (!lesson) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar aula</AlertTitle>
          <AlertDescription>
            {error ? error.message : "Não foi possível carregar a aula solicitada. Por favor, tente novamente."} 
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={navigateToCourse}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para o curso
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <LessonHeader 
            title={lesson?.title || ""} 
            moduleTitle={moduleData?.module?.title || ""}
            courseTitle={courseInfo?.title}
            courseId={courseId}
            progress={progress}
          />
          
          <div className="mt-6">
            <LessonNavigation 
              courseId={courseId!}
              currentLesson={lesson}
              allLessons={safeModuleLessons}
              onComplete={completeLesson}
              isCompleted={progress >= 100}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
            />
          </div>
          
          <div className="mt-8">
            <LessonContent 
              lesson={lesson} 
              videos={safeVideos}
              resources={safeResources}
              isCompleted={progress >= 100}
              onProgressUpdate={handleProgressUpdate} 
              onComplete={completeLesson}
            />
          </div>
        </div>
        
        <div>
          <LessonSidebar 
            currentLesson={lesson}
            module={moduleData?.module}
            lessons={safeModuleLessons}
            courseId={courseId!}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
