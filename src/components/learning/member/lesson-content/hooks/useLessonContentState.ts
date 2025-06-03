
import { useState } from "react";

export const useLessonContentState = () => {
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  return {
    showNPSModal,
    setShowNPSModal,
    showCelebrationModal,
    setShowCelebrationModal
  };
};
