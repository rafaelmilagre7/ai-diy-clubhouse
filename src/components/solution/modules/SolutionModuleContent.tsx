
import React from "react";
import { Module } from "@/lib/supabase";
import { SolutionModuleRenderer } from "./SolutionModuleRenderer";

interface SolutionModuleContentProps {
  module: Module;
}

export const SolutionModuleContent = ({ module }: SolutionModuleContentProps) => {
  if (!module.content) {
    return (
      <div className="p-4 text-center text-textSecondary">
        <p>Nenhum conteúdo disponível para este módulo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-backgroundDark/50 rounded-lg p-4 border border-white/5">
      <SolutionModuleRenderer content={module.content} />
    </div>
  );
};
