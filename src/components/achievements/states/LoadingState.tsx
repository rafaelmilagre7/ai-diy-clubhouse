
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Trophy } from "lucide-react";

export const LoadingState = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 animate-fade-in">
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
      
      {/* Progress card skeleton */}
      <Skeleton className="h-32 w-full rounded-lg mb-6">
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400 animate-pulse">Carregando suas conquistas...</p>
        </div>
      </Skeleton>
      
      {/* Tabs skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-9 w-24 rounded-md" />
          ))}
        </div>
        
        {/* Card grid skeleton */}
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-40 w-full rounded-lg">
                <div className="flex h-full items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              </Skeleton>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Skeleton key={item} className="h-48 w-full rounded-lg">
                <div className="flex h-full items-center justify-center flex-col">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-3"></div>
                  <div className="w-24 h-4 bg-gray-200 animate-pulse"></div>
                </div>
              </Skeleton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
