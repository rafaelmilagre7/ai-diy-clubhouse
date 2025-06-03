
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { CheckCircle, PlayCircle, Book } from "lucide-react";
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
        "p-4 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer bg-gray-900/20",
        "hover:shadow-lg hover:shadow-viverblue/5"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-gray-800/60 p-2 rounded-lg flex-shrink-0">
            <Book className="h-4 w-4 text-gray-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-semibold text-white text-base">{lesson.title}</h4>
              
              {/* Status Badge elegante */}
              {isCompleted ? (
                <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluída
                </Badge>
              ) : inProgress ? (
                <Badge className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                  Em andamento • {progress}%
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50">
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Iniciar
                </Badge>
              )}
            </div>
            
            {lesson.description && (
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                {lesson.description}
              </p>
            )}
            
            {/* Barra de progresso elegante */}
            {progress > 0 && (
              <div className="mt-3 w-full bg-gray-800/60 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-viverblue h-1.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          className="flex-shrink-0 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white"
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
