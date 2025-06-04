
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
}

export const LessonNavigationBar: React.FC<LessonNavigationBarProps> = ({
  isCompleted,
  onComplete,
  onPrevious,
  onNext,
  prevLesson,
  nextLesson,
  isUpdating = false
}) => {
  return (
    <div className="bg-background border-t border-border py-4 px-6 sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Botão Aula Anterior */}
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!prevLesson}
              className="w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Aula Anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
          </div>

          {/* Botão Marcar como Concluída */}
          <div className="flex-1 flex justify-center">
            <Button
              onClick={onComplete}
              disabled={isUpdating}
              variant={isCompleted ? "outline" : "default"}
              className="gap-2 min-w-[180px]"
            >
              <CheckCircle className="h-4 w-4" />
              {isUpdating ? (
                "Salvando..."
              ) : isCompleted ? (
                "Aula Concluída"
              ) : (
                "Marcar como Concluída"
              )}
            </Button>
          </div>

          {/* Botão Próxima Aula */}
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              onClick={onNext}
              className="w-full sm:w-auto gap-2"
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

        {/* Informações das aulas adjacentes (apenas em desktop) */}
        <div className="hidden lg:flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex-1">
            {prevLesson && (
              <span className="truncate">
                Anterior: {prevLesson.title}
              </span>
            )}
          </div>
          <div className="flex-1"></div>
          <div className="flex-1 text-right">
            {nextLesson ? (
              <span className="truncate">
                Próxima: {nextLesson.title}
              </span>
            ) : (
              <span>Última aula do curso</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonNavigationBar;
