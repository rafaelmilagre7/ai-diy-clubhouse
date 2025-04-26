
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { Skeleton } from "./skeleton";

interface SkeletonCardProps {
  hasImage?: boolean;
  hasHeader?: boolean;
  hasFooter?: boolean;
  className?: string;
}

export function SkeletonCard({
  hasImage = true,
  hasHeader = true,
  hasFooter = true,
  className = "",
}: SkeletonCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {hasImage && <Skeleton className="h-48 rounded-b-none" />}
      {hasHeader && (
        <CardHeader className="p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      )}
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      {hasFooter && (
        <CardFooter className="p-4 pt-0">
          <div className="flex w-full justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-1/4 rounded-md" />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
