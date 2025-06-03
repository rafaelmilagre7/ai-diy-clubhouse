
import React from "react";
import { LearningLesson } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, PlayCircle, Play } from "lucide-react";
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
        "group cursor-pointer transition-all duration-300 relative overflow-hidden bg-gray-900/80 border-gray-700/50 hover:border-gray-600/70",
        "hover:scale-105 hover:shadow-2xl hover:shadow-viverblue/20",
        // Estados visuais mais sutis e elegantes
        isCompleted && "ring-1 ring-emerald-500/30",
        inProgress && !isCompleted && "ring-1 ring-blue-500/30"
      )}
      onClick={handleClick}
    >
      {/* Thumbnail da aula em formato 9:16 */}
      <AspectRatio ratio={9/16}>
        <div className="w-full h-full relative bg-gradient-to-br from-gray-800 to-gray-900">
          {lesson.cover_image_url ? (
            <>
              <img 
                src={lesson.cover_image_url} 
                alt={lesson.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay escuro para melhor legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-viverblue/20 to-purple-900/20">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 text-white/80 mx-auto mb-2" />
                <p className="text-white/60 text-xs font-medium">Sem Imagem</p>
              </div>
            </div>
          )}
          
          {/* Overlay de hover com play button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl">
                <Play className="h-8 w-8 text-gray-900 fill-gray-900" />
              </div>
            </div>
          </div>
          
          {/* Badge de status elegante */}
          <div className="absolute top-3 right-3">
            {isCompleted ? (
              <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 shadow-lg backdrop-blur-sm">
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluída
              </Badge>
            ) : inProgress ? (
              <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 shadow-lg backdrop-blur-sm">
                {progress}%
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-white/90 hover:bg-white text-gray-900 border-0 shadow-lg backdrop-blur-sm">
                <PlayCircle className="h-3 w-3 mr-1" />
                Iniciar
              </Badge>
            )}
          </div>

          {/* Barra de progresso elegante */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-viverblue transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Informações da aula sobre a imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <h4 className="font-semibold text-white text-sm line-clamp-2 mb-1 drop-shadow-lg">
              {lesson.title}
            </h4>
            
            <div className="flex items-center justify-between text-xs">
              {lesson.estimated_time_minutes && lesson.estimated_time_minutes > 0 && (
                <div className="flex items-center gap-1 text-white/80">
                  <Clock className="h-3 w-3" />
                  <span>{lesson.estimated_time_minutes} min</span>
                </div>
              )}
              
              {lesson.difficulty_level && (
                <Badge variant="outline" className="text-xs bg-black/50 text-white/90 border-white/20">
                  {lesson.difficulty_level === 'beginner' && 'Iniciante'}
                  {lesson.difficulty_level === 'intermediate' && 'Intermediário'}
                  {lesson.difficulty_level === 'advanced' && 'Avançado'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </AspectRatio>
    </Card>
  );
};
