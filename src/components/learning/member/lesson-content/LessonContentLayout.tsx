
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LessonContentVertical } from "./LessonContentVertical";
import { LessonActionButtons } from "./LessonActionButtons";
import { LessonModalsManager } from "./LessonModalsManager";
import { LearningLesson, LearningLessonVideo, LearningResource, LearningCourse } from "@/lib/supabase";

interface LessonContentLayoutProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  isCompleted: boolean;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
  showNPSModal: boolean;
  setShowNPSModal: (show: boolean) => void;
  showCelebrationModal: boolean;
  setShowCelebrationModal: (show: boolean) => void;
  onProgressUpdate?: (videoId: string, progress: number) => void;
  onComplete: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onNPSCompleted: () => void;
  onCelebrationClose: () => void;
  course?: LearningCourse | null;
  courseStats?: any;
}

export const LessonContentLayout: React.FC<LessonContentLayoutProps> = ({
  lesson,
  videos,
  resources,
  isCompleted,
  prevLesson,
  nextLesson,
  showNPSModal,
  setShowNPSModal,
  showCelebrationModal,
  setShowCelebrationModal,
  onProgressUpdate,
  onComplete,
  onPrevious,
  onNext,
  onNPSCompleted,
  onCelebrationClose,
  course,
  courseStats
}) => {
  return (
    <>
      {/* Conteúdo principal da aula em layout vertical */}
      <LessonContentVertical
        lesson={lesson}
        videos={videos}
        resources={resources}
        onProgressUpdate={onProgressUpdate}
      />

      {/* Botões de ação fixos após todo o conteúdo */}
      <Card className="bg-cardBg border-cardBorder mt-8 sticky bottom-4 z-10 shadow-lg">
        <CardContent className="p-4">
          <LessonActionButtons
            lesson={lesson}
            isCompleted={isCompleted}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            onComplete={onComplete}
            onPrevious={onPrevious}
            onNext={onNext}
          />
        </CardContent>
      </Card>

      {/* Modais */}
      <LessonModalsManager
        lesson={lesson}
        showNPSModal={showNPSModal}
        setShowNPSModal={setShowNPSModal}
        showCelebrationModal={showCelebrationModal}
        setShowCelebrationModal={setShowCelebrationModal}
        nextLesson={nextLesson}
        onNext={onNext}
        onNPSCompleted={onNPSCompleted}
        onCelebrationClose={onCelebrationClose}
        course={course}
        courseStats={courseStats}
      />
    </>
  );
};
