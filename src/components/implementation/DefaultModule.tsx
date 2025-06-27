
import React from "react";
import { Module } from "@/lib/supabase";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
  onInteraction?: () => void;
}

export const DefaultModule = ({ module, onComplete, onInteraction }: DefaultModuleProps) => {
  const handleInteraction = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{module.title}</h1>
        {module.description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {module.description}
          </p>
        )}
      </div>

      {/* Module Content */}
      <ModuleContentRenderer 
        module={module} 
        onInteraction={handleInteraction}
      />

      {/* Complete Module Button */}
      <div className="flex justify-center pt-8">
        <Button 
          onClick={onComplete}
          size="lg"
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Concluir Módulo
        </Button>
      </div>
    </div>
  );
};
