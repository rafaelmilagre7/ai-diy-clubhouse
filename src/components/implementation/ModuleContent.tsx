
import React from "react";
import { Module } from "@/lib/supabase";
import { LandingModule } from "./LandingModule";
import { CelebrationModule } from "./CelebrationModule";
import { DefaultModule } from "./DefaultModule";

interface ModuleContentProps {
  module: Module | null;
  onComplete: () => void;
}

export const ModuleContent = ({ module, onComplete }: ModuleContentProps) => {
  if (!module) return null;
  
  switch (module.type) {
    case "landing":
      return <LandingModule onComplete={onComplete} />;
    case "celebration":
      return <CelebrationModule onComplete={onComplete} />;
    default:
      return <DefaultModule module={module} onComplete={onComplete} />;
  }
};
