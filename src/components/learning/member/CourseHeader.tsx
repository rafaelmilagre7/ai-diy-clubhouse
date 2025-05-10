
import { LearningCourse } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Book, Clock, Video } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CourseHeaderProps {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  stats?: {
    moduleCount?: number;
    lessonCount?: number;
    videoCount?: number;
    durationMinutes?: number;
  };
  firstLessonId?: string;
  courseId?: string;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  description,
  coverImage,
  stats,
  firstLessonId,
  courseId
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Imagem de capa do curso com altura reduzida */}
      <AspectRatio 
        ratio={21/5} 
        className="w-full bg-gradient-to-r from-blue-900 to-blue-700"
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Book className="h-20 w-20 text-white/30" />
          </div>
        )}
        
        {/* Gradiente sobre a imagem para melhorar a legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </AspectRatio>
      
      {/* Conteúdo sobre a imagem */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <div className="max-w-3xl">
          <h1 className="text-xl md:text-3xl font-bold mb-2">{title}</h1>
          
          <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2">
            {description}
          </p>
          
          {/* Estatísticas do curso - mantidas e destacadas */}
          {stats && (
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {stats.moduleCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  <span>{stats.moduleCount} {stats.moduleCount === 1 ? 'módulo' : 'módulos'}</span>
                </div>
              )}
              
              {stats.lessonCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  <span>{stats.lessonCount} {stats.lessonCount === 1 ? 'aula' : 'aulas'}</span>
                </div>
              )}
              
              {/* Oculta a duração quando for 0 minutos */}
              {stats.durationMinutes !== undefined && stats.durationMinutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{stats.durationMinutes} min</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
