
import React, { useState, useEffect } from "react";
import { Module } from "@/lib/supabase";
import { ModuleTitle } from "./ModuleTitle";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
}

export const DefaultModule = ({ module, onComplete }: DefaultModuleProps) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Track meaningful user interaction with content
  const handleInteraction = () => {
    setHasInteracted(true);
  };

  // Expose interaction state to parent
  useEffect(() => {
    // If module has simple content or is landing/celebration type,
    // automatically mark as interacted
    if (module.type === "landing" || module.type === "celebration") {
      setHasInteracted(true);
    }
  }, [module.type]);

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
