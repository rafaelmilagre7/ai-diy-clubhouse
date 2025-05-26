
import React from "react";
import { Card } from "@/components/ui/card";

export const TopicsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="h-32 p-4 animate-pulse mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-5 bg-muted rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/2"></div>
              <div className="flex gap-4 mt-4">
                <div className="h-4 w-16 bg-muted rounded-md"></div>
                <div className="h-4 w-16 bg-muted rounded-md"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};
