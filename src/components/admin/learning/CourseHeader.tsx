
import { Button } from "@/components/ui/button";
import { Course } from "@/types/learningTypes";
import { ArrowLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseHeaderProps {
  course: Course;
  onBack: () => void;
}

export function CourseHeader({ course, onBack }: CourseHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <Badge variant={course.published ? "default" : "secondary"}>
              {course.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {course.description && (
            <p className="text-muted-foreground line-clamp-1">{course.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <a 
            href={`/learning/course/${course.slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </a>
        </Button>
      </div>
    </div>
  );
}
