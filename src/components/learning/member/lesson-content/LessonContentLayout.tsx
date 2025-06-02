
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LessonContentTabs } from "./LessonContentTabs";
import { LessonActionButtons } from "./LessonActionButtons";
import { LessonModalsManager } from "./LessonModalsManager";
import { LearningLesson, LearningLessonVideo, LearningResource, LearningCourse, LearningProgress } from "@/lib/supabase";

interface LessonContentLayoutProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  isCompleted: boolean;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  userProgress?: LearningProgress[];
  allLessons?: LearningLesson[];
}

export const LessonContentLayout: React.FC<LessonContentLayoutProps> = ({
  lesson,
  videos,
  resources,
  isCompleted,
  prevLesson,
  nextLesson,
  activeTab,
  setActiveTab,
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
  userProgress,
  allLessons
}) => {
  return (
    <>
      <Card className="bg-cardBg border-cardBorder">
        <CardContent className="p-6">
          <LessonContentTabs
            lesson={lesson}
            videos={videos}
            resources={resources}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onProgressUpdate={onProgressUpdate}
          />

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
        userProgress={userProgress}
        allLessons={allLessons}
      />
    </>
  );
};
