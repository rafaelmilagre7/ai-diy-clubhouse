
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface LessonCompleteButtonProps {
  isCompleted: boolean;
  onComplete: () => void;
  className?: string;
  isUpdating?: boolean;
}

export const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({
  isCompleted,
  onComplete,
  className = "",
  isUpdating = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleClick = async () => {
    if (isCompleted || isProcessing || isUpdating) return;
    
    setIsProcessing(true);
    try {
      await onComplete();
    } catch (error) {
      console.error('[COMPLETE-BTN] ❌ Erro:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = isProcessing || isUpdating;

  return (
    <div className={`flex justify-end ${className}`}>
      <Button
        onClick={handleClick}
        disabled={isCompleted || loading}
        className="gap-2"
        variant={isCompleted ? "outline" : "default"}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            {isCompleted ? "Aula concluída" : "Marcar como concluída"}
          </>
        )}
      </Button>
    </div>
  );
};

export default LessonCompleteButton;
