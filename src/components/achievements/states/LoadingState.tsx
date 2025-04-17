
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export const LoadingState = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      {isMobile ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4 rounded-lg border">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="rounded-lg border p-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
