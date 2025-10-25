
import React, { memo, useMemo } from 'react';
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useCourseIndividualAccess } from "@/hooks/learning/useCourseIndividualAccess";
import { usePremiumUpgradeModal } from "@/hooks/usePremiumUpgradeModal";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  progress?: number;
  moduleCount?: number;
  lessonCount?: number;
}

export const CourseCard = memo<CourseCardProps>(({
  id,
  title,
  description,
  imageUrl,
  progress = 0,
  moduleCount,
  lessonCount
}) => {
  const isCompleted = useMemo(() => progress >= 100, [progress]);
  const { hasAccess, loading } = useCourseIndividualAccess(id);
  const { showUpgradeModal } = usePremiumUpgradeModal();
  
  // Removido handleClick - agora permite navegação para todos os cursos

  // Se está carregando, mostrar skeleton/loading
  if (loading) {
    return (
      <Card className="overflow-hidden h-full flex flex-col animate-pulse">
        <AspectRatio ratio={9/16}>
          <div className="h-full w-full bg-muted" />
        </AspectRatio>
      </Card>
    );
  }
  
  return (
    <Link to={`/learning/course/${id}`} className="block h-full group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-slow border-transparent hover:scale-105 hover:z-10 hover:shadow-xl relative">
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
                  className="w-full h-full object-cover transition-all duration-slower group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </AspectRatio>
          
          
          <Button 
            size="icon" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card/90 hover:bg-card text-foreground rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
          
          {isCompleted && (
            <div className="absolute top-2 left-2 bg-operational text-primary-foreground rounded-full p-1">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
            <h3 className="font-semibold text-lg line-clamp-1 drop-shadow-md group-hover:line-clamp-none transition-all">
              {title}
            </h3>
            
            <div className="opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              <p className="text-white/80 text-sm line-clamp-2 mt-2 drop-shadow-md">
                {description}
              </p>
              
              {progress > 0 && (
                <div className="mt-3">
                  <Progress 
                    value={progress} 
                    className="h-1 bg-white/30" 
                    indicatorClassName={isCompleted ? "bg-operational" : "bg-primary"}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span>{progress}% completo</span>
                    {isCompleted && <span>Concluído</span>}
                  </div>
                </div>
              )}
              
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
}, (prevProps, nextProps) => {
  // Comparação customizada: só re-renderizar se dados importantes mudaram
  return (
    prevProps.id === nextProps.id &&
    prevProps.progress === nextProps.progress &&
    prevProps.title === nextProps.title &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.moduleCount === nextProps.moduleCount &&
    prevProps.lessonCount === nextProps.lessonCount
  );
});
