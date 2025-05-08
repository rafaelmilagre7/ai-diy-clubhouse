
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
  return (
    <div className={`flex justify-end ${className}`}>
      <Button
        onClick={onComplete}
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
