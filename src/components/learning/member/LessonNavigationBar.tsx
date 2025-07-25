import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { LearningLesson } from "@/lib/supabase/types";
interface LessonNavigationBarProps {
  isCompleted: boolean;
  onComplete: () => void;
  onPrevious?: () => void;
  onNext: () => void;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
  isUpdating?: boolean;
  currentLessonIndex?: number;
  totalLessons?: number;
}
export const LessonNavigationBar: React.FC<LessonNavigationBarProps> = ({
  isCompleted,
  onComplete,
  onPrevious,
  onNext,
  prevLesson,
  nextLesson,
  isUpdating = false,
  currentLessonIndex = 0,
  totalLessons = 0
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Indicador de progresso */}
      {totalLessons > 0 && (
        <div className="flex items-center justify-center">
          <div className="text-sm font-medium bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 backdrop-blur-sm">
            Aula {currentLessonIndex + 1} de {totalLessons}
          </div>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Botão Aula Anterior */}
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            onClick={onPrevious} 
            disabled={!prevLesson} 
            className="w-full sm:w-auto gap-2 bg-white/10 border-0 backdrop-blur-sm hover:bg-white/20 disabled:opacity-50 disabled:bg-white/5 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Aula Anterior</span>
            <span className="sm:hidden">Anterior</span>
          </Button>
        </div>

        {/* Botão Marcar como Concluída */}
        <div className="flex justify-center">
          <Button 
            onClick={onComplete} 
            disabled={isUpdating} 
            className={`gap-2 px-6 py-3 font-medium transition-all duration-300 border-0 ${
              isCompleted 
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-600 dark:text-emerald-400 hover:from-green-500/30 hover:to-emerald-500/20 backdrop-blur-sm" 
                : "bg-gradient-to-r from-primary via-primary to-primary/80 text-white hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl backdrop-blur-sm"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${isCompleted ? "text-green-600 dark:text-emerald-400" : "text-white"}`} />
            {isUpdating ? "Salvando..." : isCompleted ? "Aula Concluída" : "Marcar como Concluída"}
          </Button>
        </div>

        {/* Botão Próxima Aula */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onNext} 
            className="w-full sm:w-auto gap-2 bg-white/10 border-0 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
          >
            <span className="hidden sm:inline">
              {nextLesson ? "Próxima Aula" : "Finalizar Curso"}
            </span>
            <span className="sm:hidden">
              {nextLesson ? "Próxima" : "Finalizar"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Informações das aulas adjacentes */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4 text-xs text-muted-foreground/80">
        <div className="text-left">
          {prevLesson && (
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 border border-white/10">
              <span className="font-medium text-primary">Anterior:</span> 
              <div className="truncate mt-1">{prevLesson.title}</div>
              {prevLesson.module?.title && (
                <div className="text-xs opacity-75 mt-1">Módulo: {prevLesson.module.title}</div>
              )}
            </div>
          )}
        </div>
        <div></div>
        <div className="text-right">
          {nextLesson ? (
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 border border-white/10">
              <span className="font-medium text-primary">Próxima:</span> 
              <div className="truncate mt-1">{nextLesson.title}</div>
              {nextLesson.module?.title && (
                <div className="text-xs opacity-75 mt-1">Módulo: {nextLesson.module.title}</div>
              )}
            </div>
          ) : (
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 border border-white/10">
              <span className="font-medium text-primary">Última aula do curso</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LessonNavigationBar;