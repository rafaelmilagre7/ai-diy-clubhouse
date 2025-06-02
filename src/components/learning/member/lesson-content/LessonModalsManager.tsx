
import React from "react";
import { LessonCompletionModal } from "../../completion/LessonCompletionModal";
import { CourseCompletionCelebrationModal } from "../../completion/CourseCompletionCelebrationModal";
import { LearningLesson, LearningCourse } from "@/lib/supabase";

interface LessonModalsManagerProps {
  lesson: LearningLesson;
  showNPSModal: boolean;
  setShowNPSModal: (show: boolean) => void;
  showCelebrationModal: boolean;
  setShowCelebrationModal: (show: boolean) => void;
  nextLesson?: LearningLesson | null;
  onNext?: () => void;
  onNPSCompleted: () => void;
  onCelebrationClose: () => void;
  course?: LearningCourse | null;
  courseStats?: any;
}

export const LessonModalsManager: React.FC<LessonModalsManagerProps> = ({
  lesson,
  showNPSModal,
  setShowNPSModal,
  showCelebrationModal,
  setShowCelebrationModal,
  nextLesson,
  onNext,
  onNPSCompleted,
  onCelebrationClose,
  course,
  courseStats
}) => {
  return (
    <>
      <LessonCompletionModal
        isOpen={showNPSModal}
        setIsOpen={setShowNPSModal}
        lesson={lesson}
        onNext={onNPSCompleted}
        nextLesson={nextLesson}
      />

      <CourseCompletionCelebrationModal
        isOpen={showCelebrationModal}
        setIsOpen={setShowCelebrationModal}
        course={course}
        courseStats={courseStats}
      />
    </>
  );
};
