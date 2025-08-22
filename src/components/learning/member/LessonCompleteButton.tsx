
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface LessonCompleteButtonProps {
  isCompleted: boolean;
  onComplete: () => void;
  className?: string;
}

export const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({
  isCompleted,
  onComplete,
  className = ""
}) => {
  const handleClick = async () => {
    console.log('[LESSON-COMPLETE-BTN] 🎯 Botão de conclusão clicado:', { isCompleted });
    
    if (!isCompleted && onComplete) {
      try {
        await onComplete();
        console.log('[LESSON-COMPLETE-BTN] ✅ Conclusão processada com sucesso');
      } catch (error) {
        console.error('[LESSON-COMPLETE-BTN] ❌ Erro ao processar conclusão:', error);
      }
    }
  };

  return (
    <div className={`flex justify-end ${className}`}>
      <Button
        onClick={handleClick}
        disabled={isCompleted}
        className="gap-2"
        variant={isCompleted ? "outline" : "default"}
      >
        <CheckCircle className="h-4 w-4" />
        {isCompleted ? "Aula concluída" : "Marcar como concluída"}
      </Button>
    </div>
  );
};

export default LessonCompleteButton;
