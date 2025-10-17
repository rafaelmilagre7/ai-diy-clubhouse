
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagBadge } from "../../tags/TagBadge";
import { useLessonTagsForLesson } from "@/hooks/useLessonTags";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";

interface LessonListItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  inProgress: boolean;
  progress: number;
  hasAccess?: boolean;
}

export const LessonListItem = ({
  lesson,
  courseId,
  isCompleted,
  inProgress,
  progress,
  hasAccess = true
}: LessonListItemProps) => {
  const { data: lessonTags } = useLessonTagsForLesson(lesson.id);
  const { showUpgradeModal } = usePremiumUpgradeModal();
  
  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      showUpgradeModal('learning', lesson.title);
    }
  };
  
  const content = (
    <div className={cn(
      "group flex items-center justify-between p-4 hover:bg-accent/20 transition-colors",
      isCompleted && "bg-green-50/50 dark:bg-green-950/20",
      inProgress && !isCompleted && "bg-blue-50/50 dark:bg-blue-950/20"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 relative">
          {!hasAccess ? (
            <div className="relative">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50 flex items-center justify-center">
                <Lock className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : isCompleted ? (
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
                lesson.difficulty_level === 'beginner' && "bg-operational/20 text-operational",
                lesson.difficulty_level === 'intermediate' && "bg-status-warning/20 text-status-warning",
                lesson.difficulty_level === 'advanced' && "bg-status-error/20 text-status-error"
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
      
      {/* Ícone de ação */}
      {!hasAccess ? (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 
                         rounded-full border border-primary/20 backdrop-blur-sm
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-primary">Upgrade</span>
          </div>
          <Lock className="h-4 w-4 text-primary" />
        </div>
      ) : (
        <Play className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
  
  // Se não tem acesso, usar div em vez de Link
  if (!hasAccess) {
    return (
      <div className="cursor-pointer" onClick={handleClick}>
        {content}
      </div>
    );
  }
  
  return (
    <Link 
      key={lesson.id}
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className="block"
      onClick={handleClick}
    >
      {content}
    </Link>
  );
};
