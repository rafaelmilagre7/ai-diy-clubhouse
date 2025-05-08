
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
    isLoading
  } = useLessonData({ 
    lessonId, 
    courseId 
  });
  
  // Gerenciar navegação entre lições
  const {
    prevLesson,
    nextLesson,
    navigateToCourse
  } = useLessonNavigation({
    courseId,
    currentLessonId: lessonId,
    lessons: moduleData?.lessons || []
  });
  
  // Gerenciar progresso da lição
  const {
    progress,
    updateProgress,
    completeLesson
  } = useLessonProgress({ lessonId });
  
  // Buscar lições completadas para o sidebar
  const { data: completedLessons = [] } = useQuery({
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
      
      return data.map(item => item.lesson_id);
    },
    enabled: !!moduleData?.module?.id
  });

  // Atualizar progresso quando o usuário interage com a lição
  const handleProgressUpdate = (videoId: string, newProgress: number) => {
    updateProgress(newProgress);
  };

  if (isLoading) {
    return <div className="container py-8">Carregando conteúdo da aula...</div>;
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
          
          {/* Alerta se o progresso for muito baixo (aula recém iniciada) */}
          {progress > 0 && progress < 5 && videos && videos.length > 0 && (
            <Alert className="mt-6 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Dica para seu aprendizado</AlertTitle>
              <AlertDescription>
                Assista os vídeos até o final para registrar seu progresso. Você pode marcar a aula como concluída ao terminar.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6">
            <LessonNavigation 
              courseId={courseId!}
              currentLesson={lesson!}
              allLessons={moduleData?.lessons || []}
              onComplete={completeLesson}
              isCompleted={progress >= 100}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
            />
          </div>
          
          <div className="mt-8">
            <LessonContent 
              lesson={lesson!} 
              videos={videos || []}
              resources={resources || []}
              isCompleted={progress >= 100}
              onProgressUpdate={handleProgressUpdate} 
              onComplete={completeLesson}
            />
          </div>
        </div>
        
        <div>
          <LessonSidebar 
            currentLesson={lesson!}
            module={moduleData?.module}
            lessons={moduleData?.lessons || []}
            courseId={courseId!}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonView;
