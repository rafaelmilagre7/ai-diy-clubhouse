
import { useCallback } from "react";
import { toast } from "sonner";
import { LearningLesson } from "@/lib/supabase";

interface UseLessonActionsProps {
  lesson: LearningLesson;
  isCompleted: boolean;
  onComplete: () => void;
  onNext?: () => void;
  setShowNPSModal: (show: boolean) => void;
  setShowCelebrationModal: (show: boolean) => void;
}

export function useLessonActions({
  lesson,
  isCompleted,
  onComplete,
  onNext,
  setShowNPSModal,
  setShowCelebrationModal
}: UseLessonActionsProps) {

  const handleComplete = useCallback(() => {
    if (isCompleted) {
      toast.info("Esta aula já foi concluída!");
      return;
    }
    
    onComplete();
    setShowNPSModal(true);
  }, [isCompleted, onComplete, setShowNPSModal]);

  const handleNPSCompleted = useCallback(() => {
    setShowNPSModal(false);
    if (onNext) {
      onNext();
    }
  }, [setShowNPSModal, onNext]);

  const handleCelebrationClose = useCallback(() => {
    setShowCelebrationModal(false);
  }, [setShowCelebrationModal]);

  return {
    handleComplete,
    handleNPSCompleted,
    handleCelebrationClose
  };
}
