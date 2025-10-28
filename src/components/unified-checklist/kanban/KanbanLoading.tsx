import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const KanbanLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Kanban Board - 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coluna 1: A Fazer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-card rounded-lg border space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Em Progresso */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-card rounded-lg border space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 3: Concluído */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg border">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-2">
            {[1].map((i) => (
              <div key={i} className="p-4 bg-card rounded-lg border space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
