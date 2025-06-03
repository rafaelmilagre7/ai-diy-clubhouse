
import { useState, useEffect } from "react";
import { Module, Progress } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface UseImplementationProgressProps {
  modules: Module[];
  progress: Progress | null;
  completedModules: number[];
  setCompletedModules: (modules: number[]) => void;
}

export const useImplementationProgress = ({
  modules,
  progress,
  completedModules,
  setCompletedModules
}: UseImplementationProgressProps) => {
  const { log } = useLogging();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  useEffect(() => {
    if (progress && progress.current_module !== null) {
      setCurrentModuleIndex(progress.current_module);
    }
  }, [progress]);

  const handleModuleComplete = () => {
    log("Marking module as complete", { moduleIndex: currentModuleIndex });
    
    if (!completedModules.includes(currentModuleIndex)) {
      const newCompletedModules = [...completedModules, currentModuleIndex];
      setCompletedModules(newCompletedModules);
    }

    // Move to next module if available
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const handleNavigateToModule = (moduleIndex: number) => {
    if (moduleIndex >= 0 && moduleIndex < modules.length) {
      setCurrentModuleIndex(moduleIndex);
    }
  };

  return {
    currentModuleIndex,
    handleModuleComplete,
    handleNavigateToModule
  };
};
