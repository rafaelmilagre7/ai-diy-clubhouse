import React, { createContext, useContext, ReactNode } from "react";
import { Module } from "@/types/supabaseTypes";

interface ModuleContextProps {
  modules: Module[];
  solutionId: string | null;
  isLoading: boolean;
  selectedModuleIndex: number | null;
  isEditing: boolean;
  handleEditModule: (index: number) => void;
  handlePreviewImplementation: () => void;
  handleBackToList: () => void;
  handleModuleSave: (updatedModule: Module) => void;
  handleCreateDefaultModules: (specificTypes?: string[]) => void;
}

const ModuleContext = createContext<ModuleContextProps | undefined>(undefined);

export const ModuleProvider: React.FC<{
  children: ReactNode;
  value: ModuleContextProps;
}> = ({ children, value }) => {
  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  );
};

export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error("useModuleContext must be used within a ModuleProvider");
  }
  return context;
};
