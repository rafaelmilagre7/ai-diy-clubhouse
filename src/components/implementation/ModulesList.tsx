
import React from "react";
import { Module } from "@/lib/supabase";
import { Check, Lock } from "lucide-react";

interface ModulesListProps {
  modules: Module[];
  currentModuleIndex: number;
  completedModules: number[];
}

export const ModulesList = ({ modules, currentModuleIndex, completedModules }: ModulesListProps) => {
  return (
    <div className="bg-[#151823] border border-neutral-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-white mb-4">Módulos</h3>
      
      <div className="space-y-2">
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(index);
          const isCurrent = index === currentModuleIndex;
          const isLocked = index > currentModuleIndex && !isCompleted;
          
          return (
            <div
              key={module.id}
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                isCurrent 
                  ? "bg-viverblue/20 border border-viverblue/40" 
                  : isCompleted
                  ? "bg-green-900/20"
                  : isLocked
                  ? "bg-neutral-800/50"
                  : "hover:bg-neutral-800/30"
              }`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : isCurrent
                  ? "bg-viverblue text-white"
                  : isLocked
                  ? "bg-neutral-600 text-neutral-400"
                  : "bg-neutral-700 text-neutral-300"
              }`}>
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  isCurrent ? "text-viverblue" : isCompleted ? "text-green-300" : isLocked ? "text-neutral-500" : "text-white"
                }`}>
                  {module.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
