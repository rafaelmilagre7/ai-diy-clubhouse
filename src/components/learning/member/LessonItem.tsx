import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { CheckCircle, Circle, Video, Clock, Lock } from "lucide-react";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";

interface LessonItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  videos?: any[];
  hasAccess?: boolean;
}

export const LessonItem = ({ lesson, courseId, isCompleted, videos = [], hasAccess = true }: LessonItemProps) => {
  const { showUpgradeModal } = usePremiumUpgradeModal();
  // Calcular a duração total dos vídeos em minutos
  const calculateDuration = (): number => {
    if (videos.length === 0 && lesson.estimated_time_minutes) {
      return lesson.estimated_time_minutes;
    }
    
    let totalSeconds = 0;
    videos.forEach(video => {
      if (video.duration_seconds) {
        totalSeconds += video.duration_seconds;
      }
    });
    
    return totalSeconds > 0 ? Math.ceil(totalSeconds / 60) : (lesson.estimated_time_minutes || 0);
  };
  
  const duration = calculateDuration();

  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      showUpgradeModal('learning', lesson.title);
    }
  };

  return (
    <Link 
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className="group flex items-center px-6 py-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors relative"
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3">
        {!hasAccess ? (
          <div className="relative">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <Lock className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : isCompleted ? (
          <CheckCircle className="h-5 w-5 text-system-healthy" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-grow">
        <h4 className={`font-medium ${isCompleted ? 'text-system-healthy' : ''}`}>
          {lesson.title}
        </h4>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {videos.length > 0 && (
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
            </span>
          )}
          
          {duration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
