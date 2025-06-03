
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
        "p-6 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer bg-gray-900/20",
        "hover:shadow-lg hover:shadow-viverblue/5"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gray-800/60 p-2 rounded-lg">
              <Book className="h-4 w-4 text-gray-300" />
            </div>
            <h4 className="font-semibold text-white text-lg">{lesson.title}</h4>
            
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
            <p className="text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">
              {lesson.description}
            </p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            {lesson.estimated_time_minutes && lesson.estimated_time_minutes > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{lesson.estimated_time_minutes} min</span>
              </div>
            )}
            
            {lesson.difficulty_level && (
              <Badge variant="outline" className="bg-gray-800/30 text-gray-400 border-gray-700 text-xs">
                {lesson.difficulty_level === 'beginner' && 'Iniciante'}
                {lesson.difficulty_level === 'intermediate' && 'Intermediário'}
                {lesson.difficulty_level === 'advanced' && 'Avançado'}
              </Badge>
            )}
          </div>
          
          {/* Barra de progresso elegante */}
          {progress > 0 && (
            <div className="mt-4 w-full bg-gray-800/60 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-viverblue h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
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
