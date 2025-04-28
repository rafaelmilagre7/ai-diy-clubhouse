
import { Skeleton } from "@/components/ui/skeleton";

export const SolutionsGridLoader = () => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Texto explicativo */}
      <div className="text-center text-gray-500 mb-4">
        <p>Carregando suas soluções personalizadas...</p>
      </div>
      
      {/* Primeira seção */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Segunda seção */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(2).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
