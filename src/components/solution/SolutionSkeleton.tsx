
import { Skeleton } from "@/components/ui/skeleton";
import { SolutionBackButton } from "./SolutionBackButton";

export function SolutionSkeleton() {
  return (
    <div className="max-w-5xl mx-auto pb-12">
      <SolutionBackButton />
      
      {/* Header skeleton */}
      <div className="mt-6">
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-6" />
      </div>
      
      {/* Main content skeleton */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left content */}
        <div className="md:col-span-2">
          {/* Tabs skeleton */}
          <div className="flex mb-6">
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          
          {/* Mobile actions skeleton */}
          <div className="md:hidden mt-6">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-6" />
            
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="flex items-center mb-3">
              <Skeleton className="h-8 w-8 rounded-full mr-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full mr-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
