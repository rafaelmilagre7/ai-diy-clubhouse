
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ChecklistLoading: React.FC = () => {
  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Checklist de Implementação</h3>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start p-4 border rounded-md">
          <Skeleton className="h-5 w-5 rounded mr-3 mt-0.5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
