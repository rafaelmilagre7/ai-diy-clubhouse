
import { Link } from "react-router-dom";
import { LearningLesson } from "@/lib/supabase";
import { CheckCircle, Circle } from "lucide-react";

interface LessonItemProps {
  lesson: LearningLesson;
  courseId: string;
  isCompleted: boolean;
}

export const LessonItem = ({ lesson, courseId, isCompleted }: LessonItemProps) => {
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
          {lesson.estimated_time_minutes && (
            <span>{lesson.estimated_time_minutes} min</span>
          )}
        </div>
      </div>
    </Link>
  );
};
