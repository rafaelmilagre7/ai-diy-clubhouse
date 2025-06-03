
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, PlayCircle, Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonListItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  inProgress: boolean;
  progress: number;
}

export const LessonListItem: React.FC<LessonListItemProps> = ({
  lesson,
  courseId,
  isCompleted,
  inProgress,
  progress
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/learning/course/${courseId}/lesson/${lesson.id}`);
  };

  return (
    <div 
      className={cn(
        "p-4 hover:bg-accent/50 transition-colors cursor-pointer border-l-4",
        isCompleted && "border-l-green-500 bg-green-50/50",
        inProgress && !isCompleted && "border-l-blue-500 bg-blue-50/50",
        !isCompleted && !inProgress && "border-l-gray-200"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Book className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
            
            {/* Status Badge */}
            {isCompleted ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            ) : inProgress ? (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-xs">
                {progress}%
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <PlayCircle className="h-3 w-3 mr-1" />
                Começar
              </Badge>
            )}
          </div>
          
          {lesson.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {lesson.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {lesson.estimated_time_minutes && lesson.estimated_time_minutes > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lesson.estimated_time_minutes} min</span>
              </div>
            )}
            
            {lesson.difficulty_level && (
              <Badge variant="outline" className="text-xs">
                {lesson.difficulty_level === 'beginner' && 'Iniciante'}
                {lesson.difficulty_level === 'intermediate' && 'Intermediário'}
                {lesson.difficulty_level === 'advanced' && 'Avançado'}
              </Badge>
            )}
          </div>
          
          {/* Barra de progresso */}
          {progress > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {isCompleted ? 'Revisar' : inProgress ? 'Continuar' : 'Começar'}
        </Button>
      </div>
    </div>
  );
};
