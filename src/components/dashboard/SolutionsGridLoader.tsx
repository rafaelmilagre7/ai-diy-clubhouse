
import { Skeleton } from "@/components/ui/skeleton";

interface SolutionsGridLoaderProps {
  title?: string;
  count?: number;
}

export const SolutionsGridLoader = ({ title = "Carregando", count = 6 }: SolutionsGridLoaderProps) => {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg shadow-sm overflow-hidden">
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
    </div>
  );
};
