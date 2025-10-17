
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const MaterialsLoading: React.FC = () => {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Materiais de Apoio</h3>
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start p-4 border rounded-md">
          <div className="bg-operational/10 p-2 rounded mr-4">
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
