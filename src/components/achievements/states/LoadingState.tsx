
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export const LoadingState = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-8 w-48 mb-4" />
      
      <Skeleton className="h-32 w-full rounded-lg mb-6" />
      
      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Skeleton key={item} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
};
