
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ToolsLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-card p-4 rounded-lg border flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="mt-auto pt-3">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
