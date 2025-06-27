
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

// Helper function to safely get module title
const getModuleTitle = (moduleData: any): string => {
  if (!moduleData) return '';
  if (typeof moduleData === 'object' && moduleData.title) {
    return moduleData.title;
  }
  if (typeof moduleData === 'string') {
    try {
      const parsed = JSON.parse(moduleData);
      return parsed.title || '';
    } catch {
      return '';
    }
  }
  return '';
};

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
    <div className="w-full max-w-4xl mx-auto">
      {/* Indicador de progresso */}
      {totalLessons > 0 && (
        <div className="flex items-center justify-center mb-4">
          <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Aula {currentLessonIndex + 1} de {totalLessons}
          </div>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Botão Aula Anterior */}
        <div className="flex justify-start">
          <Button 
            variant="outline" 
            onClick={onPrevious} 
            disabled={!prevLesson} 
            className="w-full sm:w-auto gap-2 border-gray-200 bg-sky-500 hover:bg-sky-400"
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
            variant={isCompleted ? "secondary" : "default"} 
            className={`gap-2 px-6 py-3 font-medium transition-all duration-200 ${
              isCompleted 
                ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300" 
                : "bg-viverblue text-white hover:bg-viverblue-dark shadow-lg hover:shadow-xl"
            }`}
          >
            <CheckCircle className={`h-4 w-4 ${isCompleted ? "text-green-600" : "text-white"}`} />
            {isUpdating ? "Salvando..." : isCompleted ? "Aula Concluída" : "Marcar como Concluída"}
          </Button>
        </div>

        {/* Botão Próxima Aula */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onNext} 
            className="w-full sm:w-auto gap-2 border-gray-200 bg-sky-500 hover:bg-sky-400"
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
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4 mt-3 text-xs text-muted-foreground">
        <div className="text-left">
          {prevLesson && (
            <div className="truncate">
              <span className="font-medium">Anterior:</span> {prevLesson.title}
              {prevLesson.module && (
                <div className="text-xs opacity-75">
                  Módulo: {getModuleTitle(prevLesson.module)}
                </div>
              )}
            </div>
          )}
        </div>
        <div></div>
        <div className="text-right">
          {nextLesson ? (
            <div className="truncate">
              <span className="font-medium">Próxima:</span> {nextLesson.title}
              {nextLesson.module && (
                <div className="text-xs opacity-75">
                  Módulo: {getModuleTitle(nextLesson.module)}
                </div>
              )}
            </div>
          ) : (
            <span>Última aula do curso</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonNavigationBar;
