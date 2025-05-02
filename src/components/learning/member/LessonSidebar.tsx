
import { Link } from "react-router-dom";
import { LearningLesson, LearningModule } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, BookOpen } from "lucide-react";

interface LessonSidebarProps {
  currentLesson: LearningLesson;
  module?: LearningModule;
  lessons: LearningLesson[];
  courseId: string;
  completedLessons?: string[]; // Array de IDs de aulas concluídas
}

export const LessonSidebar = ({ 
  currentLesson, 
  module, 
  lessons, 
  courseId,
  completedLessons = []
}: LessonSidebarProps) => {
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg truncate">{module?.title || "Aulas do módulo"}</CardTitle>
        <Link 
          to={`/learning/course/${courseId}`} 
          className="text-sm text-muted-foreground hover:text-foreground flex items-center"
        >
          <BookOpen className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Voltar ao curso</span>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isCurrent = lesson.id === currentLesson.id;
            
            return (
              <Link
                key={lesson.id}
                to={`/learning/course/${courseId}/lesson/${lesson.id}`}
                className={`flex items-center px-4 py-3 hover:bg-muted/50 transition-colors ${
                  isCurrent ? "bg-muted" : ""
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : isCurrent ? (
                    <Circle className="h-4 w-4 fill-primary text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className={`text-sm ${isCurrent ? "font-medium" : ""} truncate`}>
                  {lesson.title}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
