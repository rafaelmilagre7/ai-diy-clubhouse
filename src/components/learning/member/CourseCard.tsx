
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Play, Award } from "lucide-react";
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
  const isInProgress = progress > 0 && progress < 100;
  const isNotStarted = progress === 0;

  // Determinar texto e ação do botão
  const getButtonConfig = () => {
    if (isCompleted) {
      return {
        text: "Curso concluído",
        variant: "secondary" as const,
        icon: <Award className="h-4 w-4" />
      };
    } else if (isInProgress) {
      return {
        text: "Continuar curso",
        variant: "default" as const,
        icon: <Play className="h-4 w-4" />
      };
    } else {
      return {
        text: "Iniciar curso",
        variant: "default" as const,
        icon: <Play className="h-4 w-4" />
      };
    }
  };

  const buttonConfig = getButtonConfig();
  
  return (
    <Link to={`/learning/course/${id}`} className="block h-full group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 border-transparent hover:scale-105 hover:z-10 hover:shadow-xl">
        <div className="relative">
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
          
          {/* Badge de status no canto superior direito */}
          {isCompleted && (
            <Badge 
              variant="success" 
              className="absolute top-2 right-2 bg-green-500/90 text-white border-green-400"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}

          {isInProgress && (
            <Badge 
              variant="info" 
              className="absolute top-2 right-2 bg-blue-500/90 text-white border-blue-400"
            >
              Em progresso
            </Badge>
          )}
          
          {/* Botão de ação que aparece no hover */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="icon" 
              variant={isCompleted ? "secondary" : "default"}
              className={cn(
                "rounded-full w-12 h-12 shadow-lg",
                isCompleted 
                  ? "bg-green-500/90 hover:bg-green-600 text-white border-green-400" 
                  : "bg-white/90 hover:bg-white text-black"
              )}
            >
              {buttonConfig.icon}
            </Button>
          </div>
          
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
                    {isCompleted && (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluído
                      </span>
                    )}
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

              {/* Botão de ação */}
              <div className="mt-3">
                <Button 
                  variant={buttonConfig.variant}
                  size="sm" 
                  className={cn(
                    "w-full",
                    isCompleted && "bg-green-500/20 hover:bg-green-500/30 text-green-200 border-green-400"
                  )}
                >
                  {buttonConfig.icon}
                  {buttonConfig.text}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
