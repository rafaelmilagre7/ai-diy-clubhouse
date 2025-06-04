
import React from "react";
import { Module } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImplementationNavigationProps {
  modules: Module[];
  currentModuleIndex: number;
  completedModules: number[];
  onModuleSelect: (index: number) => void;
}

export const ImplementationNavigation: React.FC<ImplementationNavigationProps> = ({
  modules,
  currentModuleIndex,
  completedModules,
  onModuleSelect
}) => {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Módulos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(index);
          const isCurrent = index === currentModuleIndex;
          const isAccessible = index <= currentModuleIndex || isCompleted;
          
          return (
            <button
              key={module.id}
              onClick={() => isAccessible && onModuleSelect(index)}
              disabled={!isAccessible}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all duration-200",
                "border border-transparent hover:border-blue-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isCurrent && "bg-blue-50 border-blue-300",
                isCompleted && !isCurrent && "bg-green-50",
                !isCompleted && !isCurrent && isAccessible && "hover:bg-gray-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isCurrent ? (
                    <Play className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    Módulo {index + 1}
                  </div>
                  <div className={cn(
                    "text-sm line-clamp-2",
                    isCurrent ? "text-blue-700" : "text-gray-600"
                  )}>
                    {module.title}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
