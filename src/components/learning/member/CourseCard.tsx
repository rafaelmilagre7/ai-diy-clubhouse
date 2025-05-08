
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  progress?: number;
  moduleCount?: number;
  lessonCount?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  progress = 0,
  moduleCount,
  lessonCount
}) => {
  const isCompleted = progress >= 100;
  
  return (
    <Link to={`/learning/course/${id}`} className="block h-full">
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
        <div className="relative">
          <div 
            className={cn(
              "h-40 bg-gradient-to-r",
              !imageUrl && "from-blue-400 to-blue-600"
            )}
          >
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          
          {/* Selo de curso concluído */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
        </div>
        
        <CardContent className="pt-4 flex-grow">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-3">{description}</p>
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 flex-col items-stretch gap-3">
          {/* Exibir indicadores como quantidade de módulos/aulas */}
          {(moduleCount || lessonCount) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {moduleCount && (
                <span className="flex items-center">
                  <Book className="h-3 w-3 mr-1" />
                  {moduleCount} {moduleCount === 1 ? 'módulo' : 'módulos'}
                </span>
              )}
              
              {lessonCount && (
                <span>
                  {lessonCount} {lessonCount === 1 ? 'aula' : 'aulas'}
                </span>
              )}
            </div>
          )}
          
          {/* Barra de progresso */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2" 
              indicatorClassName={isCompleted ? "bg-green-500" : undefined}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
