
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Module } from "@/lib/supabase";
import { useImplementationData } from "./implementation/useImplementationData";

export const useModuleImplementation = () => {
  const { moduleIndex } = useParams<{ moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  
  // Get data from implementation hooks
  const {
    solution,
    modules,
    progress,
    completedModules,
    setCompletedModules,
    loading
  } = useImplementationData();
  
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
  
  return {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    completedModules
  };
};
