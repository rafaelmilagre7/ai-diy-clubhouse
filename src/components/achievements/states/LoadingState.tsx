
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";

export const LoadingState = () => {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  
  // Simula o progresso de carregamento
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barra de progresso */}
      <div className="w-full space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">
          {progress < 100 
            ? `Carregando suas conquistas... ${progress}%`
            : "Finalizando carregamento..."
          }
        </p>
      </div>

      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="hidden md:flex bg-viverblue/10 p-2 rounded-full">
          <Trophy className="h-6 w-6 text-viverblue/30" />
        </div>
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      
      {/* Progress card skeleton com animação de pulso */}
      <Skeleton className="h-32 w-full rounded-lg mb-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
            <p className="text-gray-400">Sincronizando seu progresso...</p>
          </div>
        </div>
      </Skeleton>
      
      {/* Tabs skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-9 w-24 rounded-md flex-shrink-0" />
          ))}
        </div>
        
        {/* Card grid skeleton com efeito de pulso */}
        <div className={`grid ${
          isMobile 
            ? "grid-cols-1 gap-4" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        }`}>
          {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden rounded-lg border border-gray-100"
            >
              <Skeleton className={`w-full ${isMobile ? "h-40" : "h-48"}`}>
                <div className="flex h-full items-center justify-center flex-col gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="w-32 h-3 bg-gray-200/50 animate-pulse rounded" />
                </div>
              </Skeleton>
              
              {/* Efeito de brilho deslizante */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
