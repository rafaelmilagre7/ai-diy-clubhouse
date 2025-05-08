
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase/types";

interface LessonNavigationProps {
  courseId: string;
  currentLesson: LearningLesson;
  allLessons: LearningLesson[];
  isCompleted?: boolean;
  onComplete?: () => Promise<void>;
  prevLesson?: LearningLesson | null;
  nextLesson?: LearningLesson | null;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  courseId,
  currentLesson,
  allLessons,
  isCompleted = false,
  onComplete,
  prevLesson,
  nextLesson
}) => {
  const navigate = useNavigate();

  const handleCompleteLesson = async () => {
    if (onComplete) {
      await onComplete();
    }
  };

  const handlePrevious = () => {
    if (prevLesson) {
      navigate(`/learning/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/learning/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      // Se não houver próxima aula, navegar de volta para a página do curso
      navigate(`/learning/course/${courseId}`);
    }
  };

  // Encontrar a posição atual na lista de aulas
  const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  const totalLessons = allLessons.length;
  const lessonNumber = currentIndex !== -1 ? currentIndex + 1 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de progresso */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <Progress value={isCompleted ? 100 : 0} className="h-2" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Aula {lessonNumber} de {totalLessons}
        </span>
      </div>
      
      {/* Botões de navegação */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!prevLesson}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {prevLesson ? "Aula anterior" : "Início do curso"}
          </Button>
        </div>
        
        <div className="flex-1 text-center">
          {!isCompleted ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleCompleteLesson}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Concluir aula
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Aula concluída
            </Button>
          )}
        </div>
        
        <div className="flex-1 text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="gap-1"
          >
            {nextLesson ? "Próxima aula" : "Finalizar curso"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonNavigation;
