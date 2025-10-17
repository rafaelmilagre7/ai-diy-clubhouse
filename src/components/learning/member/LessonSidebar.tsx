
import { Link } from "react-router-dom";
import { LearningLesson, LearningModule } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, BookOpen, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  // Garantir que lessons e completedLessons sejam sempre arrays
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const safeCompletedLessons = Array.isArray(completedLessons) ? completedLessons : [];
  
  // Cálculo simples de progresso
  const totalLessons = safeLessons.length;
  const completedCount = safeCompletedLessons.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{module?.title || "Aulas do módulo"}</CardTitle>
          <Button 
            variant="ghost"
            size="sm"
            asChild
            className="p-0 h-auto"
          >
            <Link to={`/learning/course/${courseId}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Voltar</span>
            </Link>
          </Button>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                progressPercentage < 100 ? "bg-operational" : "bg-system-healthy"
              )} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {safeLessons.map((lesson) => {
            const isCompleted = safeCompletedLessons.includes(lesson.id);
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
                    <CheckCircle className="h-4 w-4 text-system-healthy" />
                  ) : isCurrent ? (
                    <Circle className="h-4 w-4 fill-operational text-operational" />
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
