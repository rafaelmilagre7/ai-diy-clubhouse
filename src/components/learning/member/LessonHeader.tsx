
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
    <div className="space-y-4">
      {/* Breadcrumb para navegação */}
      {courseTitle && courseId && (
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/learning" className="text-muted-foreground/80 hover:text-primary transition-colors">Cursos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/learning/course/${courseId}`} className="text-muted-foreground/80 hover:text-primary transition-colors">{courseTitle}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/50" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground">{moduleTitle}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex items-center gap-3 text-sm text-muted-foreground/80 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <span>Módulo: {moduleTitle}</span>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold text-foreground leading-tight">{title}</h1>
        {isCompleted && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Concluído</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground">Progresso da aula</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-3 bg-white/10 border border-white/20 rounded-full overflow-hidden"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
