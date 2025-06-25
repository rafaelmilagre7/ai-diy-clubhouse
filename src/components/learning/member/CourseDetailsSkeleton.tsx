
import { Skeleton } from "@/components/ui/skeleton";

export const CourseDetailsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-64 w-full mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton className="h-8 w-3/4 mb-4" />
          
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
};
