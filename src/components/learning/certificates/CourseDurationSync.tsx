import React from "react";
import { Button } from "@/components/ui/button";
import { Timer, RefreshCw, X, Clock } from "lucide-react";
import { useOptimizedCourseDurationSync } from "@/hooks/useOptimizedCourseDurationSync";
import { Progress } from "@/components/ui/progress";

export const CourseDurationSync = () => {
  const { 
    syncAllCourses, 
    generationState, 
    loadingState, 
    cancelGeneration, 
    isProcessing 
  } = useOptimizedCourseDurationSync();

  const handleSyncAll = async () => {
    if (isProcessing) return;
    await syncAllCourses();
  };

  const handleCancel = () => {
    cancelGeneration();
  };

  const showProgress = generationState.isGenerating && generationState.progress > 0;
  const showLoadingBar = loadingState.isLoading && loadingState.progress > 0;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSyncAll}
          disabled={isProcessing}
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 font-medium shadow-sm hover:shadow-md group"
          title="Sincronizar durações de todos os cursos para certificados mais precisos"
        >
          {isProcessing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Timer className="h-4 w-4 mr-2 group-hover:animate-pulse" />
          )}
          {isProcessing ? "Sincronizando..." : "⏱️ Sincronizar Durações"}
        </Button>
        
        {isProcessing && (
          <Button
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            title="Cancelar sincronização"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progresso da sincronização */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                {generationState.currentStep}
              </span>
            </div>
            <span className="text-primary font-medium">
              {generationState.progress}%
            </span>
          </div>
          <Progress value={generationState.progress} className="h-2" />
        </div>
      )}

      {/* Progresso do loading otimizado */}
      {showLoadingBar && !showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processando...</span>
            <span className="text-primary font-medium">
              {loadingState.progress}%
            </span>
          </div>
          <Progress value={loadingState.progress} className="h-2" />
        </div>
      )}

      {/* Timeout warning */}
      {loadingState.hasTimedOut && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          ⚠️ Operação demorou mais que o esperado. Verifique os logs ou tente novamente.
        </div>
      )}
    </div>
  );
};