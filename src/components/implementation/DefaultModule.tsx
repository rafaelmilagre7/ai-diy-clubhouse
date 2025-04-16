
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleTitle } from "./ModuleTitle";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { useModuleInteraction } from "./hooks/useModuleInteraction";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
}

export const DefaultModule = ({ module, onComplete }: DefaultModuleProps) => {
  // Use the module interaction hook to track user interaction
  const { handleInteraction } = useModuleInteraction(module, onComplete);
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <h2 className="text-2xl font-semibold">
        <ModuleTitle type={module.type} />
      </h2>
      
      <ModuleContentRenderer 
        module={module}
        onInteraction={handleInteraction}
      />
    </div>
  );
};
