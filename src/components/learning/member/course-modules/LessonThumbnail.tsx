
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonThumbnailProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  inProgress: boolean;
  progress: number;
}

export const LessonThumbnail: React.FC<LessonThumbnailProps> = ({
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
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden group",
        // Verde para aulas concluídas
        isCompleted && "ring-2 ring-green-500/20 border-green-200",
        // Azul para aulas em progresso  
        inProgress && !isCompleted && "ring-2 ring-blue-500/20 border-blue-200"
      )}
      onClick={handleClick}
    >
      {/* Thumbnail da aula em formato 9:16 */}
      <AspectRatio ratio={9/16}>
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 relative">
          {lesson.cover_image_url ? (
            <img 
              src={lesson.cover_image_url} 
              alt={lesson.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-blue-400" />
            </div>
          )}
          
          {/* Overlay com status */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Badge de status no canto superior direito */}
          <div className="absolute top-2 right-2">
            {isCompleted ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            ) : inProgress ? (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">
                {progress}%
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                <PlayCircle className="h-3 w-3 mr-1" />
                Começar
              </Badge>
            )}
          </div>

          {/* Barra de progresso na parte inferior */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </AspectRatio>
      
      {/* Informações da aula */}
      <div className="p-3">
        <h4 className="font-medium text-sm line-clamp-2 mb-1">
          {lesson.title}
        </h4>
        
        {lesson.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {lesson.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
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
      </div>
    </Card>
  );
};
