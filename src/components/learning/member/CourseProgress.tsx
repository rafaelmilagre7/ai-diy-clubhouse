
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RefreshProgressButton } from "./RefreshProgressButton";

interface CourseProgressProps {
  percentage: number;
  className?: string;
  courseId?: string;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ 
  percentage, 
  className,
  courseId
}) => {
  const isCompleted = percentage >= 100;
  
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Seu progresso</h3>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            isCompleted ? "text-green-500" : "text-primary"
          )}>
            {percentage}%
          </span>
          <RefreshProgressButton courseId={courseId} />
        </div>
      </div>
      
      <Progress
        value={percentage}
        className="h-2"
        indicatorClassName={isCompleted ? "bg-green-500" : undefined}
      />
      
      <p className="text-sm text-muted-foreground mt-2">
        {isCompleted ? (
          "Você já completou este curso, parabéns!"
        ) : percentage > 0 ? (
          `Continue assistindo para completar o curso`
        ) : (
          "Comece a assistir as aulas para registrar seu progresso"
        )}
      </p>
    </Card>
  );
};
