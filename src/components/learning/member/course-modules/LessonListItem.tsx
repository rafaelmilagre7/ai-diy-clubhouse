
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeJsonParseObject } from "@/utils/jsonUtils";

interface LessonListItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  inProgress: boolean;
  progress: number;
}

export const LessonListItem = ({
  lesson,
  courseId,
  isCompleted,
  inProgress,
  progress
}: LessonListItemProps) => {
  // Parse seguro do conteúdo da lição
  const content = safeJsonParseObject(lesson.content, {});
  const difficultyLevel = content.difficulty_level || 'beginner';

  return (
    <Link 
      key={lesson.id}
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className={cn(
        "flex items-center justify-between p-4 hover:bg-accent/20 transition-colors",
        isCompleted && "bg-green-50/50 dark:bg-green-950/20",
        inProgress && !isCompleted && "bg-blue-50/50 dark:bg-blue-950/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : inProgress ? (
            <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
              <div 
                className="h-3 w-3 rounded-full bg-primary" 
                style={{ clipPath: `circle(${progress}% at center)` }}
              />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50" />
          )}
        </div>
        
        <div>
          <div className="font-medium">{lesson.title}</div>
          <div className="flex items-center gap-2 mt-1">
            {/* Corrigido: buscar difficulty_level do content */}
            {difficultyLevel && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                difficultyLevel === 'beginner' && "bg-green-100 text-green-800",
                difficultyLevel === 'intermediate' && "bg-yellow-100 text-yellow-800",
                difficultyLevel === 'advanced' && "bg-red-100 text-red-800"
              )}>
                {difficultyLevel === 'beginner' && "Iniciante"}
                {difficultyLevel === 'intermediate' && "Intermediário"}
                {difficultyLevel === 'advanced' && "Avançado"}
              </span>
            )}
            
            {inProgress && !isCompleted && (
              <Badge variant="secondary" className="text-xs">
                {progress}% concluído
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <Play className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};
