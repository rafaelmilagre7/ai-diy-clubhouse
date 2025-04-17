
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Module } from "@/lib/supabase";
import { useImplementationData } from "./implementation/useImplementationData";

export const useModuleImplementation = () => {
  // Get data from implementation hooks
  const {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  } = useImplementationData();
  
  // Current module state - always use the first module (index 0)
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  
  // Set current module to the first module
  useEffect(() => {
    if (modules.length > 0) {
      setCurrentModule(modules[0]);
    } else {
      setCurrentModule(null);
    }
  }, [modules]);
  
  return {
    solution,
    modules,
    currentModule,
    loading,
    completedModules
  };
};
