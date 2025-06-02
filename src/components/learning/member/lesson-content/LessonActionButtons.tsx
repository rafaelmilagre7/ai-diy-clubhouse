
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { LearningLesson } from "@/lib/supabase";

interface LessonActionButtonsProps {
  lesson: LearningLesson;
  isCompleted: boolean;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
  onComplete: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const LessonActionButtons: React.FC<LessonActionButtonsProps> = ({
  lesson,
  isCompleted,
  prevLesson,
  nextLesson,
  onComplete,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-white/10">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!prevLesson}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {prevLesson ? `Aula anterior` : "Primeira aula"}
      </Button>

      <Button
        onClick={onComplete}
        disabled={isCompleted}
        className={`flex items-center gap-2 px-6 ${
          isCompleted 
            ? "bg-green-600 hover:bg-green-600 cursor-default" 
            : "bg-viverblue hover:bg-viverblue-dark"
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
        {isCompleted ? "Aula concluída" : "Marcar como concluída"}
      </Button>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!nextLesson}
        className="flex items-center gap-2"
      >
        {nextLesson ? `Próxima aula` : "Última aula"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
