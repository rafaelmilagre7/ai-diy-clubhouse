
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LearningLesson } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface LessonNavigationProps {
  courseId: string;
  currentLesson: LearningLesson;
  allLessons: LearningLesson[];
  onComplete: () => void;
  isCompleted: boolean;
}

export const LessonNavigation = ({ 
  courseId, 
  currentLesson, 
  allLessons,
  onComplete,
  isCompleted
}: LessonNavigationProps) => {
  const navigate = useNavigate();
  
  // Encontrar o índice da lição atual
  const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  
  // Determinar as lições anterior e próxima
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  
  // Navegar para a lição anterior
  const goToPreviousLesson = () => {
    if (previousLesson) {
      navigate(`/learning/course/${courseId}/lesson/${previousLesson.id}`);
    }
  };
  
  // Navegar para a próxima lição
  const goToNextLesson = () => {
    if (nextLesson) {
      navigate(`/learning/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      // Se não houver próxima lição, voltar para o curso
      navigate(`/learning/course/${courseId}`);
    }
  };
  
  // Marcar lição como concluída
  const markAsComplete = () => {
    onComplete();
  };

  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={goToPreviousLesson}
        disabled={!previousLesson}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>
      
      <div>
        {!isCompleted ? (
          <Button onClick={markAsComplete}>
            <Check className="mr-2 h-4 w-4" />
            Marcar como concluída
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <Check className="mr-2 h-4 w-4" />
            Concluída
          </Button>
        )}
      </div>
      
      <Button
        variant={nextLesson ? "default" : "outline"}
        onClick={goToNextLesson}
      >
        {nextLesson ? "Próxima" : "Voltar ao curso"}
        {nextLesson && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};
