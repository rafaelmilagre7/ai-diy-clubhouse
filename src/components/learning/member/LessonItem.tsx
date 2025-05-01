
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { CheckCircle, Circle, Clock, Video } from "lucide-react";

interface LessonItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
  videos?: any[];
}

export const LessonItem = ({ lesson, courseId, isCompleted, videos = [] }: LessonItemProps) => {
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

  return (
    <Link 
      to={`/learning/course/${courseId}/lesson/${lesson.id}`}
      className="flex items-center px-6 py-3 hover:bg-muted/50 border-b last:border-b-0 transition-colors"
    >
      <div className="flex-shrink-0 mr-3">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-grow">
        <h4 className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>
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
