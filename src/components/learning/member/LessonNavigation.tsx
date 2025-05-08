
import { useState } from "react";
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LessonNavigationProps {
  courseId: string;
  currentLesson: LearningLesson;
  allLessons: LearningLesson[];
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  courseId,
  currentLesson,
  allLessons,
  onComplete,
  isCompleted = false
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Encontrar índice da aula atual
  const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);

  // Determinar aulas anterior e próxima
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Manipular conclusão da aula
  const handleCompleteLesson = async () => {
    if (!onComplete) return;
    
    setIsCompleting(true);
    try {
      await onComplete();
      setIsConfirmOpen(false);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:justify-between">
        <div>
          {prevLesson ? (
            <Button 
              variant="outline" 
              asChild
              size="sm"
              className="flex items-center"
            >
              <Link to={`/learning/course/${courseId}/lesson/${prevLesson.id}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Aula anterior
              </Link>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              disabled
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Aula anterior
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-center">
          {isCompleted ? (
            <Button variant="ghost" disabled className="text-green-500">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aula concluída
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Marcar como concluída
            </Button>
          )}
        </div>
        
        <div>
          {nextLesson ? (
            <Button 
              variant={isCompleted ? "default" : "outline"} 
              asChild
              size="sm"
              className="flex items-center ml-auto"
            >
              <Link to={`/learning/course/${courseId}/lesson/${nextLesson.id}`}>
                Próxima aula
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              disabled
            >
              Próxima aula
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Diálogo de confirmação para marcar como concluído */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar aula como concluída?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja marcar esta aula como concluída? Isso atualizará seu progresso no curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteLesson} disabled={isCompleting}>
              {isCompleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
