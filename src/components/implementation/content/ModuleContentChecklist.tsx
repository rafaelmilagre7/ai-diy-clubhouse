
import React from "react";
import { Module } from "@/lib/supabase";
import { ChecklistDisplay } from "./checklist/ChecklistDisplay";
import { safeJsonParseObject } from "@/lib/supabase/types";

interface ModuleContentChecklistProps {
  module: Module;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  // Parse content safely and check for checklist
  const content = safeJsonParseObject(module.content, {});
  const checklist = content.checklist || [];

  if (!checklist || (Array.isArray(checklist) && checklist.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lista de Verificação</h2>
      <ChecklistDisplay module={module} />
    </div>
  );
};
