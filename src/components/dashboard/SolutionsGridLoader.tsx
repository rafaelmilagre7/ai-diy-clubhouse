
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SolutionsGridLoaderProps {
  title: string;
  count: number;
}

export const SolutionsGridLoader: FC<SolutionsGridLoaderProps> = ({ title, count }) => {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2 bg-muted" />
        <Skeleton className="h-4 w-96 bg-muted" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full bg-muted" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                  <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
