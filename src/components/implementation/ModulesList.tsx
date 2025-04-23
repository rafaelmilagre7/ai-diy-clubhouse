
import React from 'react';
import { Module } from '@/types/solution';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModulesListProps {
  currentModuleIdx: number;
  onModuleChange: (moduleIdx: number) => void;
  completedModules: number[];
  modules?: Module[];
}

export const ModulesList = ({
  currentModuleIdx,
  onModuleChange,
  completedModules,
  modules = []
}: ModulesListProps) => {
  const isModuleCompleted = (idx: number) => completedModules.includes(idx);
  const isModuleAvailable = (idx: number) => {
    // O módulo está disponível se: 
    // 1. É o módulo atual, ou
    // 2. É um módulo anterior, ou
    // 3. O módulo anterior foi concluído
    return idx === currentModuleIdx || 
           idx < currentModuleIdx ||
           (idx > 0 && isModuleCompleted(idx - 1));
  };

  return (
    <div className="space-y-1 mb-4">
      <h3 className="font-medium text-sm mb-2 px-2">Módulos da implementação</h3>
      {modules.map((module, idx) => (
        <Button
          key={module.id}
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start text-left mb-1 overflow-hidden",
            idx === currentModuleIdx ? "bg-muted" : "",
            isModuleCompleted(idx) ? "text-green-600" : "",
            !isModuleAvailable(idx) ? "opacity-50 cursor-not-allowed" : "",
          )}
          onClick={() => isModuleAvailable(idx) && onModuleChange(idx)}
          disabled={!isModuleAvailable(idx)}
        >
          <div className="flex items-center w-full">
            {isModuleCompleted(idx) ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : !isModuleAvailable(idx) ? (
              <Lock className="mr-2 h-4 w-4" />
            ) : (
              <Circle className="mr-2 h-4 w-4" />
            )}
            <span className="truncate">{module.title || `Módulo ${idx + 1}`}</span>
          </div>
        </Button>
      ))}
    </div>
  );
};
