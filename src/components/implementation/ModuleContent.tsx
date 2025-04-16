
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { LandingModule } from "./LandingModule";
import { CelebrationModule } from "./CelebrationModule";
import { DefaultModule } from "./DefaultModule";
import { toast } from "sonner";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
}

export const ModuleContent = ({ module, onComplete }: ModuleContentProps) => {
  useEffect(() => {
    // Mostra um toast quando um novo módulo é carregado
    if (module) {
      const moduleTypes = {
        "landing": "Visão Geral",
        "overview": "Visão Geral",
        "preparation": "Preparação Express",
        "implementation": "Implementação Passo a Passo",
        "verification": "Verificação",
        "results": "Primeiros Resultados",
        "optimization": "Otimização",
        "celebration": "Celebração"
      };
      
      const moduleTitle = moduleTypes[module.type] || module.title;
      
      toast.success(`Módulo carregado: ${moduleTitle}`, {
        id: `module-${module.id}`,
        duration: 3000
      });
    }
  }, [module?.id]);
  
  if (!module) return null;
  
  // Renderiza o conteúdo apropriado com base no tipo do módulo
  switch (module.type) {
    case "landing":
      return <LandingModule module={module} onComplete={onComplete} />;
    case "celebration":
      return <CelebrationModule module={module} onComplete={onComplete} />;
    default:
      return <DefaultModule module={module} onComplete={onComplete} />;
  }
};
