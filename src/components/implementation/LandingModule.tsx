
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";
import { shouldAutoComplete } from "./content/ContentManager";
import { useLogging } from "@/hooks/useLogging";
import { safeJsonParseObject } from "@/lib/supabase/types";

interface LandingModuleProps {
  module: Module;
  onComplete: () => void;
}

export const LandingModule = ({ module, onComplete }: LandingModuleProps) => {
  const { log } = useLogging();
  
  useEffect(() => {
    // Auto-complete landing module after viewing
    if (shouldAutoComplete(module.type)) {
      const timer = setTimeout(() => {
        log("Auto-completing landing module", { module_id: module.id });
        onComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [module, onComplete, log]);

  // Parse content safely
  const content = safeJsonParseObject(module.content, {});
  const description = content.description || module.description || "Bem-vindo! Vamos começar esta jornada de implementação.";

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Play className="w-12 h-12 text-blue-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: String(description) }} className="text-lg text-gray-600" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Pronto para começar?</h3>
          <p className="text-gray-600">
            Esta implementação irá guiá-lo passo a passo através do processo de configuração e otimização.
          </p>
          
          <Button 
            onClick={onComplete} 
            className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Iniciar Implementação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingModule;
