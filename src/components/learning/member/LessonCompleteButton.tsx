
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useLessonCompletion } from "@/hooks/learning";

interface LessonCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
  onComplete?: () => void;
  className?: string;
}

export const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({
  lessonId,
  isCompleted: initialCompleted,
  onComplete,
  className = ""
}) => {
  const { completeLesson, isCompleting, isCompleted } = useLessonCompletion({
    lessonId,
    onSuccess: onComplete
  });

  const completed = isCompleted || initialCompleted;

  return (
    <div className={`flex justify-end ${className}`}>
      <Button
        onClick={completeLesson}
        disabled={completed || isCompleting}
        className="gap-2"
        variant={completed ? "outline" : "default"}
      >
        {isCompleting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            {completed ? "Aula concluída" : "Marcar como concluída"}
          </>
        )}
      </Button>
    </div>
  );
};

export default LessonCompleteButton;
