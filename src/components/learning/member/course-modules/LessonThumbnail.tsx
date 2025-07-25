
import { Link } from "react-router-dom";
import { LearningLesson, LearningProgress } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagBadge } from "../../tags/TagBadge";
import { useLessonTagsForLesson } from "@/hooks/useLessonTags";

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
  const { data: lessonTags } = useLessonTagsForLesson(lesson.id);
  return (
    <Link 
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className="block group"
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        {/* Aspect Ratio 9:16 - Formato Netflix */}
        <AspectRatio ratio={9/16}>
          {lesson.cover_image_url ? (
            <img 
              src={lesson.cover_image_url} 
              alt={lesson.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-viverblue via-aurora to-primary flex items-center justify-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-8 right-6 w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="absolute top-1/2 right-4 w-6 h-6 bg-white/15 rounded-full"></div>
              </div>
              
              {/* Lesson Number/Title */}
              <div className="text-center px-4 relative z-10">
                <div className="text-2xl font-bold text-white mb-2">
                  {lesson.order_index ? `#${lesson.order_index}` : '#'}
                </div>
                <div className="text-sm font-medium text-white/90 line-clamp-3">
                  {lesson.title}
                </div>
              </div>
            </div>
          )}
          
          {/* Aurora Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          
          {/* Hover Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                {lesson.title}
              </h4>
              
              {lesson.description && (
                <p className="text-xs text-white/80 line-clamp-2">
                  {lesson.description}
                </p>
              )}
              
              {/* Difficulty Badge */}
              {lesson.difficulty_level && (
                <div className="flex">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm",
                    lesson.difficulty_level === 'beginner' && "bg-emerald-500/80 text-white",
                    lesson.difficulty_level === 'intermediate' && "bg-amber-500/80 text-white",
                    lesson.difficulty_level === 'advanced' && "bg-red-500/80 text-white"
                  )}>
                    {lesson.difficulty_level === 'beginner' && "Iniciante"}
                    {lesson.difficulty_level === 'intermediate' && "Intermediário"}
                    {lesson.difficulty_level === 'advanced' && "Avançado"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Indicators */}
          {isCompleted && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
          
          {/* Progress Bar */}
          {progress > 0 && !isCompleted && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <div 
                className="h-full bg-gradient-to-r from-viverblue to-aurora transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {/* Play Button - Centro */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
            <div className="bg-white/90 hover:bg-white rounded-full p-4 shadow-2xl backdrop-blur-sm group-hover:shadow-aurora/50 transition-all duration-300">
              <Play className="h-6 w-6 fill-primary text-primary translate-x-0.5" />
            </div>
          </div>
        </AspectRatio>
      </div>
      
      {/* Info Section */}
      <div className="mt-3 space-y-2">
        <h5 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {lesson.title}
        </h5>
        
        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {inProgress && !isCompleted && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-viverblue/10 text-viverblue border-viverblue/20"
            >
              {progress}% concluído
            </Badge>
          )}
          
          {isCompleted && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200"
            >
              ✓ Concluído
            </Badge>
          )}
        </div>

        {/* Tags */}
        {lessonTags && lessonTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lessonTags.slice(0, 2).map(({ lesson_tags: tag }) => (
              <TagBadge
                key={tag.id}
                tag={tag}
                size="sm"
                className="text-xs"
              />
            ))}
            {lessonTags.length > 2 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                +{lessonTags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
