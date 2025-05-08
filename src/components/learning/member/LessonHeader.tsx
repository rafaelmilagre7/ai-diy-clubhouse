
import { Progress } from "@/components/ui/progress";
import { CheckCircle, BookOpen } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  courseTitle?: string;
  courseId?: string;
  progress: number;
}

export const LessonHeader = ({ 
  title, 
  moduleTitle, 
  courseTitle,
  courseId,
  progress 
}: LessonHeaderProps) => {
  const isCompleted = progress >= 100;
  
  return (
    <div>
      {/* Breadcrumb para navegação */}
      {courseTitle && courseId && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/learning">Cursos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/learning/course/${courseId}`}>{courseTitle}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{moduleTitle}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <BookOpen className="h-4 w-4" />
        <span>Módulo: {moduleTitle}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {isCompleted && (
          <div className="flex items-center gap-1 bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Concluído</span>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progresso da aula</span>
          <span>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
          color={isCompleted ? "bg-green-500" : undefined}
        />
      </div>
    </div>
  );
};
