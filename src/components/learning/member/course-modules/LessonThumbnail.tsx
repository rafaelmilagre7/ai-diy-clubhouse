
import { Link } from "react-router-dom";
import { LearningLesson, LearningProgress } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeJsonParseObject } from "@/utils/jsonUtils";

interface LessonThumbnailProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  inProgress: boolean;
  progress: number;
}

export const LessonThumbnail = ({ 
  lesson, 
  courseId, 
  isCompleted, 
  inProgress, 
  progress 
}: LessonThumbnailProps) => {
  // Parse seguro do conteúdo da lição
  const content = safeJsonParseObject(lesson.content, {});
  const difficultyLevel = content.difficulty_level || 'beginner';

  return (
    <Link 
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className="block group"
    >
      <div className="relative overflow-hidden rounded-md">
        <AspectRatio ratio={9/16}>
          {/* Removido: cover_image_url não existe no schema */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <span className="font-semibold text-white">{lesson.title}</span>
          </div>
          
          {/* Overlay para exibir informação completa em hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
            <div>
              <h4 className="font-medium text-white">{lesson.title}</h4>
              {lesson.description && (
                <p className="text-xs text-white/80 mt-1 line-clamp-2">{lesson.description}</p>
              )}
            </div>
            
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
            </div>
          </div>
          
          {/* Indicadores de status (completo) */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          
          {/* Barra de progresso */}
          {progress > 0 && !isCompleted && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {/* Ícone de Play centralizado em hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-full p-3 text-primary shadow-xl">
              <Play className="h-6 w-6 fill-current" />
            </div>
          </div>
        </AspectRatio>
      </div>
      
      <div className="mt-2">
        <div className="font-medium line-clamp-1">{lesson.title}</div>
        <div className="flex items-center gap-2 mt-1">
          {inProgress && !isCompleted && (
            <Badge variant="secondary" className="text-xs">
              {progress}% concluído
            </Badge>
          )}
          
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
              Concluído
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};
