
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function MinimalTrailLoader() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border border-neutral-700/30 rounded-lg bg-neutral-800/20">
      <div className="flex items-center gap-3 flex-1">
        <Sparkles className="h-4 w-4 text-viverblue animate-pulse" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}
