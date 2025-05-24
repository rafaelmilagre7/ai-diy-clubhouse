
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonErrorBoundary } from "@/components/learning/member/LessonErrorBoundary";
import { ProgressIndicator } from "@/components/learning/member/ProgressIndicator";
import { useLessonData } from "@/hooks/learning/useLessonData";
import { useLessonNavigationNonLinear } from "@/hooks/learning/useLessonNavigationNonLinear";
import { useLessonProgressNonLinear } from "@/hooks/learning/useLessonProgressNonLinear";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { sortLessonsByNumber } from "@/components/learning/member/course-modules/CourseModulesHelpers";

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  
  // Buscar dados da lição
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
  
  // Arrays seguros
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeModuleLessons = moduleData?.lessons ? 
    (Array.isArray(moduleData.lessons) ? sortLessonsByNumber([...moduleData.lessons]) : []) : [];
  
  // Sistema de progresso não-linear
  const {
    progress,
    isLoading: isProgressLoading,
    error: progressError,
    updateProgress,
    completeLesson,
    canAccessLesson
  } = useLessonProgressNonLinear({ 
    lessonId,
    autoInitialize: true // Inicializar automaticamente quando acessar a aula
  });
  
  // Navegação flexível
  const {
    prevLesson,
    nextLesson,
    navigateToCourse,
    navigateToNext,
    navigateToPrevious,
    canNavigateToNext,
    canNavigateToPrevious
  } = useLessonNavigationNonLinear({
    courseId,
    currentLessonId: lessonId,
    lessons: safeModuleLessons,
    allowFreeNavigation: true // Permitir navegação livre
  });
  
  // Buscar lições completadas para contexto adicional
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
      
      return Array.isArray(data) ? data.map(item => item.lesson_id) : [];
    },
    enabled: !!moduleData?.module?.id
  });
  
  const completedLessons = Array.isArray(completedLessonsData) ? completedLessonsData : [];

  // Função para atualizar progresso com melhor tratamento
  const handleProgressUpdate = (videoId: string, newProgress: number) => {
    try {
      updateProgress(newProgress);
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  // Função para completar lição com feedback
  const handleCompleteLesson = async () => {
    try {
      const success = await completeLesson();
      if (!success) {
        console.error("Falha ao completar lição");
      }
    } catch (error) {
      console.error("Erro ao completar lição:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Verificação de acesso (sempre permitido para não-linear)
  if (!canAccessLesson) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso restrito</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar esta aula no momento.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={navigateToCourse}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o curso
        </Button>
      </div>
    );
  }
  
  // Se não tiver a lição, mostrar erro com melhor feedback
  if (!lesson) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar aula</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              {error ? error.message : "Não foi possível carregar a aula solicitada."}
            </p>
            <p className="text-sm">
              Isso pode ser um problema temporário. Tente recarregar a página ou voltar ao curso.
            </p>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </Button>
          <Button
            variant="default"
            onClick={navigateToCourse}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LessonErrorBoundary>
      <div className="container py-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={navigateToCourse}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o curso
        </Button>
        
        <div>
          <LessonHeader 
            title={lesson?.title || ""} 
            moduleTitle={moduleData?.module?.title || ""}
            courseTitle={courseInfo?.title}
            courseId={courseId}
            progress={progress}
          />
          
          {/* Indicador de progresso aprimorado */}
          <div className="mt-4 mb-6">
            <ProgressIndicator
              progress={progress}
              isLoading={isProgressLoading}
              hasError={!!progressError}
              isCompleted={progress >= 100}
              showPercentage={true}
              size="md"
            />
          </div>
          
          <div className="mt-8">
            <LessonContent 
              lesson={lesson} 
              videos={safeVideos}
              resources={safeResources}
              isCompleted={progress >= 100}
              onProgressUpdate={handleProgressUpdate} 
              onComplete={handleCompleteLesson}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              courseId={courseId}
              allLessons={safeModuleLessons}
              onNextLesson={navigateToNext}
            />
          </div>
        </div>
      </div>
    </LessonErrorBoundary>
  );
};

export default LessonView;
