
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
    <div className="relative w-full overflow-hidden">
      {/* Hero Banner - Estilo Netflix */}
      <div className="relative h-[70vh] min-h-[500px] w-full">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-aurora-primary via-aurora-primary-light to-primary flex items-center justify-center">
            <Book className="h-32 w-32 text-white/20" />
          </div>
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                {title}
              </h1>
              
              {description && (
                <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
              
              {/* Stats - Moderno */}
              {stats && (
                <div className="flex flex-wrap items-center gap-6 text-white/80">
                  {stats.moduleCount !== undefined && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <Book className="h-5 w-5" />
                      <span className="font-medium">{stats.moduleCount} {stats.moduleCount === 1 ? 'módulo' : 'módulos'}</span>
                    </div>
                  )}
                  
                  {stats.lessonCount !== undefined && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <Video className="h-5 w-5" />
                      <span className="font-medium">{stats.lessonCount} {stats.lessonCount === 1 ? 'aula' : 'aulas'}</span>
                    </div>
                  )}
                  
                  {stats.durationMinutes !== undefined && stats.durationMinutes > 0 && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">{stats.durationMinutes} min</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
