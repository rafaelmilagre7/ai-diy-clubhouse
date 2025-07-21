
import React from "react";
import { Module } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { Badge } from "@/components/ui/badge";

interface WizardStepContentProps {
  module: Module;
  onComplete: () => void;
  onInteraction: () => void;
}

export const WizardStepContent: React.FC<WizardStepContentProps> = ({
  module,
  onComplete,
  onInteraction
}) => {
  const getModuleTypeBadge = (type: string) => {
    const badges = {
      cover: { label: "Visão Geral", variant: "secondary" as const },
      tools: { label: "Ferramentas", variant: "default" as const },
      materials: { label: "Materiais", variant: "default" as const },
      videos: { label: "Vídeos", variant: "default" as const },
      implementation: { label: "Implementação", variant: "default" as const },
      checklist: { label: "Verificação", variant: "default" as const },
      completion: { label: "Conclusão", variant: "secondary" as const },
    };
    
    return badges[type as keyof typeof badges] || { label: "Módulo", variant: "default" as const };
  };
  
  const badgeInfo = getModuleTypeBadge(module.type);
  
  return (
    <div className="animate-fade-in">
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={badgeInfo.variant} className="text-xs">
              {badgeInfo.label}
            </Badge>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {module.title}
          </h2>
          
          {module.content?.description && (
            <p className="text-slate-600 text-lg leading-relaxed">
              {module.content.description}
            </p>
          )}
        </div>
        
        <div className="min-h-[400px]">
          <ModuleContent
            module={module}
            onComplete={onComplete}
            onError={(error) => {
              console.error("Module error:", error);
            }}
          />
        </div>
      </Card>
    </div>
  );
};
