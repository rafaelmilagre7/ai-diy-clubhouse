
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { LessonHeader } from '@/components/learning/member/LessonHeader';
import { LessonContent } from '@/components/learning/member/LessonContent';
import { LessonSidebar } from '@/components/learning/member/LessonSidebar';
import { useLessonData } from '@/hooks/learning/useLessonData';
import { useLessonProgress } from '@/hooks/learning/useLessonProgress';
import { useLessonNavigation } from '@/hooks/learning/useLessonNavigation';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

const LessonView = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  // Buscar dados da aula
  const {
    lesson,
    resources,
    videos,
    courseInfo,
    moduleData,
    isLoading: isLoadingLesson
  } = useLessonData({ lessonId, courseId });

  // Progresso da aula
  const {
    progress,
    isCompleted,
    updateProgress,
    markAsCompleted,
    isLoading: isLoadingProgress
  } = useLessonProgress(lessonId);

  // Navegação entre aulas
  const {
    prevLesson,
    nextLesson,
    navigateToPrevious,
    navigateToNext,
    navigateToCourse
  } = useLessonNavigation({
    courseId,
    currentLessonId: lessonId,
    lessons: moduleData?.lessons || []
  });

  const isLoading = isLoadingLesson || isLoadingProgress;

  // Função para atualizar progresso de vídeo
  const handleVideoProgress = (videoId: string, progress: number) => {
    if (updateProgress) {
      updateProgress(videoId, progress);
    }
  };

  // Função para marcar aula como concluída
  const handleCompleteLesson = async () => {
    try {
      if (markAsCompleted) {
        await markAsCompleted();
        toast.success('Aula marcada como concluída!');
      }
    } catch (error) {
      console.error('Erro ao completar aula:', error);
      toast.error('Erro ao marcar aula como concluída');
    }
  };

  // Função para navegar para próxima aula
  const handleNextLesson = () => {
    if (nextLesson) {
      navigateToNext();
    } else {
      navigateToCourse();
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando aula..." />;
  }

  if (!lesson) {
    return (
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <GraduationCap className="w-6 h-6 text-viverblue" />
                Aula não encontrada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A aula que você está procurando não foi encontrada ou não está disponível.
              </p>
              <Button onClick={() => navigate('/learning')}>
                Voltar para cursos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Botão de voltar */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={navigateToCourse}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o curso
        </Button>

        {/* Layout responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cabeçalho da aula */}
            <LessonHeader
              title={lesson.title}
              moduleTitle={moduleData?.module?.title || 'Módulo'}
              courseTitle={courseInfo?.title}
              courseId={courseId}
              progress={progress}
            />

            {/* Conteúdo da aula */}
            <LessonContent
              lesson={lesson}
              videos={videos}
              resources={resources}
              isCompleted={isCompleted}
              onProgressUpdate={handleVideoProgress}
              onComplete={handleCompleteLesson}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              courseId={courseId}
              allLessons={moduleData?.lessons || []}
              onNextLesson={handleNextLesson}
              course={courseInfo}
            />
          </div>

          {/* Sidebar com navegação */}
          <div className="lg:col-span-1">
            <LessonSidebar
              currentLesson={lesson}
              module={moduleData?.module}
              lessons={moduleData?.lessons || []}
              courseId={courseId || ''}
              completedLessons={[]} // TODO: Implementar lista de aulas concluídas
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
