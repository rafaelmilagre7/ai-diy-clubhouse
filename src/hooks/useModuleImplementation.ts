
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Module } from "@/lib/supabase";
import { useImplementationData } from "./implementation/useImplementationData";
import { useProgressTracking } from "./implementation/useProgressTracking";
import { useImplementationNavigation } from "./implementation/useImplementationNavigation";

export const useModuleImplementation = () => {
  const { moduleIndex } = useParams<{ moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const navigate = useNavigate();
  
  // Get data from implementation hooks
  const {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  } = useImplementationData();
  
  const {
    handleComplete,
    handlePrevious
  } = useImplementationNavigation();
  
  // Current module state
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  
  // Set current module based on moduleIndex
  useEffect(() => {
    if (modules.length > 0 && moduleIdx < modules.length) {
      setCurrentModule(modules[moduleIdx]);
    } else {
      setCurrentModule(null);
    }
  }, [modules, moduleIdx]);
  
  // Progress tracking
  const {
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(
    progress, 
    completedModules, 
    setCompletedModules,
    6 // Set total modules to 6 instead of calculating from modules.length
  );
  
  // Custom complete handler to mark as completed and navigate
  const handleCompleteAndNavigate = () => {
    // If this is the last module (index 5), show the confirmation modal
    if (moduleIdx >= 5) {
      setShowConfirmationModal(true);
      return;
    }
    
    // Otherwise mark as completed and navigate
    handleMarkAsCompleted();
    handleComplete();
  };
  
  return {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    completedModules,
    handleComplete,
    handlePrevious,
    handleMarkAsCompleted: handleCompleteAndNavigate,
    handleConfirmImplementation,
    showConfirmationModal,
    setShowConfirmationModal,
    calculateProgress,
    isCompleting,
    hasInteracted,
    setModuleInteraction
  };
};
