
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
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 border-transparent hover:scale-105 hover:z-10 hover:shadow-xl relative">
        {/* Exclusive Content Overlay - só aparece quando não tem acesso */}
        {!hasAccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-30 flex items-center justify-center backdrop-blur-sm group-hover:backdrop-blur-lg transition-all duration-300">
            <div className="text-center space-y-4 group-hover:scale-105 transition-transform duration-300">
              {/* Energy Ring with Lock */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-conic from-primary via-primary/50 to-primary rounded-full animate-spin-slow opacity-30 group-hover:opacity-60 transition-opacity duration-300" 
                     style={{ width: '80px', height: '80px' }} />
                <div className="relative p-4 bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full w-fit mx-auto shadow-2xl backdrop-blur-sm border border-white/10">
                  <Lock className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                {/* Sparkle Particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse opacity-60" />
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary-glow rounded-full animate-ping opacity-40" />
                <div className="absolute top-3 -left-3 w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/10">
                  <Lock className="h-3 w-3 mr-2" />
                  Conteúdo Exclusivo
                </Badge>
                <p className="text-white/90 text-sm font-medium drop-shadow-md group-hover:text-white transition-colors duration-300">
                  Entre para ver as aulas
                </p>
              </div>
            </div>
          </div>
        )}
        
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
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </AspectRatio>
          
          {/* Exclusive Badge no topo - só aparece quando não tem acesso */}
          {!hasAccess && (
            <Badge 
              className="absolute top-2 right-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white border-0 shadow-lg backdrop-blur-sm z-20 border border-white/10"
            >
              <Lock className="h-3 w-3 mr-1" />
              Exclusivo
            </Badge>
          )}
          
          <Button 
            size="icon" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
          
          {isCompleted && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
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
                    indicatorClassName={isCompleted ? "bg-green-500" : "bg-primary"}
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
};
