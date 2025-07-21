
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, PlayCircle, Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface NavigationModule {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  current: boolean;
}

interface EnhancedImplementationNavigationProps {
  modules: NavigationModule[];
  solutionId: string;
  currentModule: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
}

export const EnhancedImplementationNavigation = ({ 
  modules, 
  solutionId, 
  currentModule,
  onPrevious,
  onNext,
  canGoNext = true
}: EnhancedImplementationNavigationProps) => {
  const navigate = useNavigate();
  
  const completedCount = modules.filter(module => module.completed).length;
  const progressPercentage = (completedCount / modules.length) * 100;
  const isLastModule = currentModule === modules.length - 1;
  const isFirstModule = currentModule === 0;

  const handleModuleClick = (moduleIndex: number) => {
    // Only allow navigation to current or completed modules
    if (moduleIndex <= currentModule || modules[moduleIndex].completed) {
      navigate(`/implement/${solutionId}/${moduleIndex}`);
    }
  };

  const getModuleIcon = (module: NavigationModule, index: number) => {
    if (module.completed) return CheckCircle2;
    if (module.current) return PlayCircle;
    if (module.type === 'completion') return Trophy;
    return Circle;
  };

  const getModuleStatus = (module: NavigationModule, index: number) => {
    if (module.completed) return 'completed';
    if (module.current) return 'current';
    if (index <= currentModule) return 'available';
    return 'locked';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-viverblue-light bg-clip-text text-transparent">
            Progresso da Implementação
          </h3>
          <div className="text-right">
            <div className="text-sm text-viverblue font-medium">
              {completedCount} de {modules.length}
            </div>
            <div className="text-xs text-neutral-400">etapas concluídas</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Início</span>
            <span>{Math.round(progressPercentage)}% completo</span>
            <span>Conclusão</span>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-2 mb-6">
        {modules.map((module, index) => {
          const Icon = getModuleIcon(module, index);
          const status = getModuleStatus(module, index);
          const isClickable = status === 'completed' || status === 'current' || status === 'available';
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleClick(index)}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 group",
                isClickable && "hover:bg-white/10 cursor-pointer",
                !isClickable && "cursor-not-allowed opacity-50",
                status === 'current' && "bg-viverblue/20 border border-viverblue/30 shadow-lg",
                status === 'completed' && "bg-green-500/10 border border-green-500/20"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  status === 'completed' && "text-green-400",
                  status === 'current' && "text-viverblue animate-pulse",
                  status === 'available' && "text-neutral-300 group-hover:text-viverblue",
                  status === 'locked' && "text-neutral-600"
                )} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate transition-colors duration-200",
                  status === 'completed' && "text-green-300",
                  status === 'current' && "text-viverblue",
                  status === 'available' && "text-neutral-200 group-hover:text-white",
                  status === 'locked' && "text-neutral-500"
                )}>
                  {module.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-neutral-400 capitalize">
                    {module.type}
                  </p>
                  {status === 'completed' && (
                    <span className="text-xs text-green-400 font-medium">
                      ✓ Concluído
                    </span>
                  )}
                </div>
              </div>
              
              {/* Step Number */}
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200",
                status === 'completed' && "bg-green-500/20 text-green-300",
                status === 'current' && "bg-viverblue/20 text-viverblue",
                status === 'available' && "bg-white/10 text-neutral-400",
                status === 'locked' && "bg-neutral-800 text-neutral-600"
              )}>
                {index + 1}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <Button
          onClick={onPrevious}
          disabled={isFirstModule}
          variant="outline"
          size="sm"
          className="border-white/20 text-neutral-300 hover:bg-white/10 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        
        <div className="text-center">
          <div className="text-xs text-neutral-400">
            Etapa {currentModule + 1} de {modules.length}
          </div>
        </div>
        
        <Button
          onClick={onNext}
          disabled={isLastModule || !canGoNext}
          variant="outline"
          size="sm"
          className="border-viverblue/30 text-viverblue hover:bg-viverblue/10 disabled:opacity-50"
        >
          Próxima
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
