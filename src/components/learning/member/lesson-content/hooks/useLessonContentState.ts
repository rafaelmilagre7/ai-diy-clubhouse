
import { useState } from "react";

export function useLessonContentState() {
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  return {
    showNPSModal,
    setShowNPSModal,
    showCelebrationModal,
    setShowCelebrationModal,
    activeTab,
    setActiveTab
  };
}
