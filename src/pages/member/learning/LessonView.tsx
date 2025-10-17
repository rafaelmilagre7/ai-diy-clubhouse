
import { useEffect, Suspense } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useLearningRedirect } from '@/hooks/learning/useLearningRedirect';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { LessonContent } from "@/components/learning/member/LessonContent";
import { LessonHeader } from "@/components/learning/member/LessonHeader";
import { LessonLoadingSkeleton } from "@/components/learning/LessonLoadingSkeleton";
import { useLessonData } from "@/hooks/learning/useLessonData";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";
import { useLessonProgress } from "@/hooks/learning/useLessonProgress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const location = useLocation();
  
  // Sistema de validação e redirecionamento automático
  useLearningRedirect({
    courseId,
    lessonId,
    currentPath: location.pathname
  });
  
  // Buscar dados da lição usando hooks personalizados
  const {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    allCourseLessons,
    isLoading,
    error,
    extractedCourseId // Novo campo com courseId extraído
  } = useLessonData({ 
    lessonId, 
    courseId 
  });
  
  // Usar courseId válido (extraído da lição se necessário)
  const validCourseId = extractedCourseId || courseId;
  
  console.log('🔧 [LESSON-VIEW] CourseId Status:', {
    fromParams: courseId,
    extracted: extractedCourseId,
    final: validCourseId,
    isValid: validCourseId && validCourseId !== 'undefined'
  });
  
  // Garantir que temos arrays válidos
  const safeResources = Array.isArray(resources) ? resources : [];
  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeAllCourseLessons = Array.isArray(allCourseLessons) ? allCourseLessons : [];
  
  // Gerenciar navegação entre lições usando TODAS as aulas do curso
  const {
    prevLesson,
    nextLesson,
    navigateToCourse,
    navigateToNext,
    navigateToPrevious
  } = useLessonNavigation({
    courseId: validCourseId, // Usar courseId válido
    currentLessonId: lessonId,
    lessons: safeAllCourseLessons // Usar todas as aulas do curso em vez de apenas do módulo
  });
  
  // Gerenciar progresso da lição
  const {
    isCompleted,
    updateProgress,
    completeLesson,
    isUpdating
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
    return <LessonLoadingSkeleton />;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="absolute inset-0" style={{ backgroundImage: 'var(--gradient-radial-purple)' }} />
      <div className="relative">
        <div className="container py-6">
          <Button
            variant="ghost"
            className="mb-6 bg-white/10 border-0 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            onClick={navigateToCourse}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o curso
          </Button>
          
          {/* Conteúdo principal da aula com Suspense */}
          <div className="space-y-6">
            <LessonHeader 
              title={lesson?.title || ""} 
              moduleTitle={moduleData?.module?.title || ""}
              courseTitle={courseInfo?.title}
              courseId={validCourseId} // Usar courseId válido
              progress={isCompleted ? 100 : 0}
            />
            
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl min-h-[400px]">
              <Suspense fallback={
                <div className="w-full h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }>
                <LessonContent 
                  lesson={lesson} 
                  videos={safeVideos}
                  resources={safeResources}
                  isCompleted={isCompleted}
                  onProgressUpdate={handleProgressUpdate} 
                  onComplete={completeLesson}
                  prevLesson={prevLesson}
                  nextLesson={nextLesson}
                  courseId={validCourseId} // Usar courseId válido
                  allLessons={safeAllCourseLessons}
                  onNextLesson={navigateToNext}
                  onPreviousLesson={navigateToPrevious}
                  isUpdating={isUpdating}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
