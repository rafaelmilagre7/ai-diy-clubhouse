
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RefreshProgressButton } from "./RefreshProgressButton";
import { Loader2 } from "lucide-react";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(percentage);
  
  // Animar mudança de percentual
  useEffect(() => {
    if (percentage !== displayPercentage) {
      setIsSyncing(true);
      
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
        setIsSyncing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [percentage, displayPercentage]);
  
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Seu progresso</h3>
        <div className="flex items-center gap-2">
          {isSyncing && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          <span className={cn(
            "font-medium transition-all duration-300",
            isCompleted ? "text-system-healthy" : "text-primary",
            isSyncing && "scale-110"
          )}>
            {displayPercentage}%
          </span>
          <RefreshProgressButton courseId={courseId} />
        </div>
      </div>
      
      <Progress
        value={displayPercentage}
        className="h-2"
        indicatorClassName={isCompleted ? "bg-system-healthy" : undefined}
      />
      
      <p className="text-sm text-muted-foreground mt-2">
        {isCompleted ? (
          "Você já completou este curso, parabéns!"
        ) : displayPercentage > 0 ? (
          `Continue assistindo para completar o curso`
        ) : (
          "Comece a assistir as aulas para registrar seu progresso"
        )}
      </p>
    </Card>
  );
};
