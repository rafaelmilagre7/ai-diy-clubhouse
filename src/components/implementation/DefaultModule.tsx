
import React, { useState } from "react";
import { Module } from "@/lib/supabase";
import { ModuleTitle } from "./ModuleTitle";
import { ModuleContentRenderer } from "./content/ModuleContentRenderer";
import { useModuleInteraction } from "./hooks/useModuleInteraction";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface DefaultModuleProps {
  module: Module;
  onComplete: () => void;
}

export const DefaultModule = ({ module, onComplete }: DefaultModuleProps) => {
  // Use the module interaction hook to track user interaction
  const { handleInteraction } = useModuleInteraction(module, onComplete);
  const { log } = useLogging();
  const [hasRead, setHasRead] = useState(false);
  
  // Handle user explicitly marking content as read
  const handleMarkAsRead = () => {
    log("User marked content as read", { module_id: module.id });
    setHasRead(true);
    handleInteraction();
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <h2 className="text-2xl font-semibold">
        <ModuleTitle type={module.type} />
      </h2>
      
      <ModuleContentRenderer 
        module={module}
        onInteraction={handleInteraction}
      />
      
      {/* Explicit confirmation button */}
      {!hasRead && (
        <div className="pt-6 border-t mt-10">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleMarkAsRead}
          >
            <CheckSquare className="h-5 w-5" />
            Confirmar que li este conteúdo
          </Button>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Confirme que você leu e compreendeu o conteúdo acima para poder continuar.
          </p>
        </div>
      )}
    </div>
  );
};
