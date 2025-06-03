
import React, { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LessonContentLayout } from "./lesson-content/LessonContentLayout";
import { useLessonContentState } from "./lesson-content/hooks/useLessonContentState";
import { useLessonActions } from "./lesson-content/hooks/useLessonActions";
import { useLessonValidation } from "./lesson-content/hooks/useLessonValidation";
import { useCourseCompletion } from "@/hooks/learning";
import { LearningLesson, LearningLessonVideo, LearningResource, LearningCourse, LearningProgress } from "@/lib/supabase";

interface LessonContentProps {
  lesson: LearningLesson | null;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  isCompleted: boolean;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  onComplete: () => void;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
  courseId?: string;
  allLessons?: LearningLesson[];
  onNextLesson?: () => void;
  userProgress?: LearningProgress[];
  course?: LearningCourse | null;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  videos,
  resources,
  isCompleted,
  onProgressUpdate,
  onComplete,
  prevLesson,
  nextLesson,
  courseId,
  allLessons = [],
  onNextLesson,
  userProgress = [],
  course
}) => {
  const {
    showNPSModal,
    setShowNPSModal,
    showCelebrationModal,
    setShowCelebrationModal,
    activeTab,
    setActiveTab
  } = useLessonContentState();

  const {
    handleComplete,
    handleNPSCompleted,
    handleCelebrationClose
  } = useLessonActions({
    lesson: lesson!,
    isCompleted,
    onComplete,
    onNext: onNextLesson,
    setShowNPSModal,
    setShowCelebrationModal
  });

  const validation = useLessonValidation({ lesson, videos, resources });

  // Hook para detectar conclusão do curso
  const {
    courseStats,
    shouldShowCelebration,
    resetCelebration
  } = useCourseCompletion({
    courseId,
    currentLessonId: lesson?.id,
    allLessons,
    userProgress,
    isCurrentLessonCompleted: isCompleted
  });

  // Detectar quando mostrar a celebração de conclusão do curso
  useEffect(() => {
    if (shouldShowCelebration && !showCelebrationModal) {
      setShowCelebrationModal(true);
    }
  }, [shouldShowCelebration, showCelebrationModal, setShowCelebrationModal]);

  // Função para fechar celebração e resetar estado
  const handleCelebrationCloseWithReset = () => {
    handleCelebrationClose();
    resetCelebration();
  };

  if (!validation.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar o conteúdo da aula. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <LessonContentLayout
      lesson={lesson!}
      videos={videos}
      resources={resources}
      isCompleted={isCompleted}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showNPSModal={showNPSModal}
      setShowNPSModal={setShowNPSModal}
      showCelebrationModal={showCelebrationModal}
      setShowCelebrationModal={setShowCelebrationModal}
      onProgressUpdate={onProgressUpdate}
      onComplete={handleComplete}
      onNext={onNextLesson}
      onNPSCompleted={handleNPSCompleted}
      onCelebrationClose={handleCelebrationCloseWithReset}
      course={course}
      courseStats={courseStats}
    />
  );
};
