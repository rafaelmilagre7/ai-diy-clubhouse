
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationModule {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  current: boolean;
}

interface ImplementationNavigationProps {
  modules: NavigationModule[];
  solutionId: string;
  currentModule: number;
}

export const ImplementationNavigation = ({ 
  modules, 
  solutionId, 
  currentModule 
}: ImplementationNavigationProps) => {
  const navigate = useNavigate();

  const handleModuleClick = (moduleIndex: number) => {
    // Only allow navigation to current or completed modules
    if (moduleIndex <= currentModule || modules[moduleIndex].completed) {
      navigate(`/implement/${solutionId}/${moduleIndex}`);
    }
  };

  return (
    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl">
      <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-aurora-primary-light bg-clip-text text-transparent">
        Módulos de Implementação
      </h3>
      
      <div className="space-y-3">
        {modules.map((module, index) => {
          const isClickable = index <= currentModule || module.completed;
          const isCurrent = module.current;
          const isCompleted = module.completed;
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(index)}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200",
                isClickable 
                  ? "hover:bg-white/10 cursor-pointer" 
                  : "cursor-not-allowed opacity-50",
                isCurrent && "bg-aurora-primary/20 border border-aurora-primary/30",
                isCompleted && !isCurrent && "bg-green-500/10 border border-green-500/20"
              )}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : isCurrent ? (
                  <PlayCircle className="h-5 w-5 text-aurora-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isCurrent ? "text-aurora-primary" : 
                  isCompleted ? "text-green-400" : 
                  isClickable ? "text-neutral-200" : "text-neutral-500"
                )}>
                  {module.title}
                </p>
                <p className="text-xs text-neutral-400 capitalize">
                  {module.type}
                </p>
              </div>
              
              <div className="flex-shrink-0 text-xs text-neutral-500">
                {index + 1}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
