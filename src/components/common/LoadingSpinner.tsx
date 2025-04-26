
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingSpinner = ({ size = 8 }) => (
  <div className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-[#0ABAB5]`}></div>
);

// Componente para carregamento de conteúdo inline
export const ContentLoading = () => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      <Skeleton className="h-8 w-3/4 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-24 w-full rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded" />
        <Skeleton className="h-32 rounded" />
      </div>
    </div>
  );
};

// Componente de carregamento de cards
export const CardsLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default { LoadingSpinner, ContentLoading, CardsLoading };
