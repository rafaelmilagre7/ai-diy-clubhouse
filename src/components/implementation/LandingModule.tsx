
import React from "react";
import { Module } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

interface LandingModuleProps {
  module: Module;
  onComplete: () => void;
}

export const LandingModule = ({ module, onComplete }: LandingModuleProps) => {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-viverblue/20 rounded-full p-4">
            <Play className="h-12 w-12 text-viverblue" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{module.title}</h1>
        
        {module.description && (
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            {module.description}
          </p>
        )}

        {module.content && (
          <div className="prose prose-sm max-w-none text-muted-foreground mb-8">
            <div dangerouslySetInnerHTML={{ __html: module.content }} />
          </div>
        )}

        <Button 
          onClick={onComplete}
          size="lg"
          className="flex items-center gap-2"
        >
          Começar Implementação
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
