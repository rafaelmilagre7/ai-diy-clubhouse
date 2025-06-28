
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { safeJsonParseObject } from "@/lib/supabase/types";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
  onInteraction?: () => void;
}

export const DefaultModule = ({ module, onComplete, onInteraction }: DefaultModuleProps) => {
  // Parse content safely
  const content = safeJsonParseObject(module.content, {});
  const description = content.description || module.description;

  const handleInteraction = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
        {description && (
          <p className="text-lg text-gray-600">{description}</p>
        )}
      </div>

      {/* Module Content */}
      <ModuleContentRenderer 
        module={module} 
        onInteraction={handleInteraction}
      />
    </div>
  );
};

export default DefaultModule;
