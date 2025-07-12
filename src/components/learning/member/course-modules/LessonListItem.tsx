
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagBadge } from "../../tags/TagBadge";
import { useLessonTagsForLesson } from "@/hooks/useLessonTags";

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
  const { data: lessonTags } = useLessonTagsForLesson(lesson.id);
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
        
        <div className="flex-1">
          <div className="font-medium">{lesson.title}</div>
          <div className="flex items-center gap-2 mt-1">
            {lesson.difficulty_level && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                lesson.difficulty_level === 'beginner' && "bg-green-100 text-green-800",
                lesson.difficulty_level === 'intermediate' && "bg-yellow-100 text-yellow-800",
                lesson.difficulty_level === 'advanced' && "bg-red-100 text-red-800"
              )}>
                {lesson.difficulty_level === 'beginner' && "Iniciante"}
                {lesson.difficulty_level === 'intermediate' && "Intermediário"}
                {lesson.difficulty_level === 'advanced' && "Avançado"}
              </span>
            )}
            
            {inProgress && !isCompleted && (
              <Badge variant="secondary" className="text-xs">
                {progress}% concluído
              </Badge>
            )}
          </div>

          {/* Tags */}
          {lessonTags && lessonTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lessonTags.slice(0, 4).map(({ lesson_tags: tag }) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  size="sm"
                  className="text-xs"
                />
              ))}
              {lessonTags.length > 4 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  +{lessonTags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Play className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};
