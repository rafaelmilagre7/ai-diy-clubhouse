
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const ToolsLoading = () => {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Overlay com contador */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Carregando ferramentas... <span className="font-mono">{loadingTime}s</span>
          </p>
          {loadingTime > 5 && (
            <p className="text-xs text-muted-foreground/70">
              Aguarde, estamos buscando os dados...
            </p>
          )}
        </div>
      </div>
      
      {/* Skeletons abaixo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-40">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-card p-4 rounded-lg border flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="mt-auto pt-3">
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
