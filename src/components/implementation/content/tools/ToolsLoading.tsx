
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const ToolsLoading = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="animate-pulse border">
          <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
