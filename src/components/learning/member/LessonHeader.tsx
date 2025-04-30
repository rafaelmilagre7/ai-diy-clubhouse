
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  progress: number;
}

export const LessonHeader = ({ title, moduleTitle, progress }: LessonHeaderProps) => {
  const isCompleted = progress >= 100;
  
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">
        Módulo: {moduleTitle}
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {isCompleted && (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso da aula</span>
          <span>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
          color={isCompleted ? "bg-green-500" : undefined}
        />
        {isCompleted && (
          <p className="text-xs text-muted-foreground mt-1 text-right">
            Aula concluída
          </p>
        )}
      </div>
    </div>
  );
};
