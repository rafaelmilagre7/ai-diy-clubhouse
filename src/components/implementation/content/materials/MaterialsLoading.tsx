
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MaterialsLoading = () => {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
      
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};
