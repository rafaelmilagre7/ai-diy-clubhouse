
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const ToolsLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start p-4 border rounded-md">
          <div className="bg-blue-100 p-2 rounded mr-4">
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
