
import { Skeleton } from "@/components/ui/skeleton";

export const SolutionsGridLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="border rounded-lg shadow-sm overflow-hidden">
          <Skeleton className="h-[160px] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
