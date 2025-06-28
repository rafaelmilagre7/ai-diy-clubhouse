
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2 } from "lucide-react";
import { shouldAutoComplete } from "./content/ContentManager";
import { useLogging } from "@/hooks/useLogging";
import { Badge } from "@/components/ui/badge";
import { safeJsonParseObject } from "@/lib/supabase/types";

interface CelebrationModuleProps {
  module: Module;
  onComplete: () => void;
}

export const CelebrationModule = ({ module, onComplete }: CelebrationModuleProps) => {
  const { log } = useLogging();
  
  useEffect(() => {
    // Auto-complete celebration module after viewing
    if (shouldAutoComplete(module.type)) {
      const timer = setTimeout(() => {
        log("Auto-completing celebration module", { module_id: module.id });
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [module, onComplete, log]);

  const handleDownloadCertificate = () => {
    log("User requested certificate download", { module_id: module.id });
    // Certificate download logic would go here
  };

  const handleShareSuccess = () => {
    log("User shared success", { module_id: module.id });
    // Share success logic would go here
  };

  // Parse content safely
  const content = safeJsonParseObject(module.content, {});
  const description = content.description || module.description || "Parabéns! Você concluiu esta implementação com sucesso.";

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: String(description) }} className="text-lg text-gray-600" />
        </div>

        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Implementação Concluída
        </Badge>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xl font-semibold">Próximos passos</h3>
          
          <div className="grid gap-3">
            <Button 
              onClick={handleDownloadCertificate}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Certificado
            </Button>
            
            <Button 
              onClick={handleShareSuccess}
              className="w-full"
              variant="outline"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar Conquista
            </Button>
            
            <Button 
              onClick={onComplete} 
              className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              Finalizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CelebrationModule;
