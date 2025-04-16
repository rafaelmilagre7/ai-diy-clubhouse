
import React, { useEffect } from "react";
import { Module } from "@/lib/supabase";
import { LandingModule } from "./LandingModule";
import { CelebrationModule } from "./CelebrationModule";
import { DefaultModule } from "./DefaultModule";
import { shouldAutoComplete } from "./content/ContentManager";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
}

export const ModuleContent = ({ module, onComplete }: ModuleContentProps) => {
  // Mark landing and celebration modules as automatically interacted with
  useEffect(() => {
    if (module && shouldAutoComplete(module)) {
      onComplete();
    }
  }, [module, onComplete]);

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
