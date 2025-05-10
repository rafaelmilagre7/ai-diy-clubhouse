
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Book, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

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
    <Link to={`/learning/course/${id}`} className="block h-full group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 border-transparent hover:scale-105 hover:z-10 hover:shadow-xl">
        <div className="relative">
          {/* Alterando o AspectRatio para formato vertical 9:16 */}
          <AspectRatio ratio={9/16}>
            <div 
              className={cn(
                "h-full w-full bg-gradient-to-r",
                !imageUrl && "from-blue-400 to-blue-600"
              )}
            >
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              {/* Gradiente para melhorar legibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </AspectRatio>
          
          {/* Botão de play que aparece no hover */}
          <Button 
            size="icon" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
          
          {/* Selo de curso concluído */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          
          {/* Informações do curso sobrepostas na imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg line-clamp-1 drop-shadow-md group-hover:line-clamp-none transition-all">
              {title}
            </h3>
            
            <div className="opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              <p className="text-white/80 text-sm line-clamp-2 mt-2 drop-shadow-md">
                {description}
              </p>
              
              {/* Barra de progresso */}
              {progress > 0 && (
                <div className="mt-3">
                  <Progress 
                    value={progress} 
                    className="h-1 bg-white/30" 
                    indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>{progress}% completo</span>
                    {isCompleted && <span>Concluído</span>}
                  </div>
                </div>
              )}
              
              {/* Indicadores de módulos e aulas */}
              {(moduleCount || lessonCount) && (
                <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
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
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
