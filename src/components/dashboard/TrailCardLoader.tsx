
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function TrailCardLoader() {
  return (
    <Card className="w-full border-viverblue/20 bg-gradient-to-br from-viverblue/5 via-transparent to-viverblue/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-viverblue animate-pulse" />
            <span>Trilha de Implementação</span>
            <span className="text-sm font-normal text-viverblue bg-viverblue/10 px-2 py-1 rounded-full">
              IA
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* AI Header Skeleton */}
        <div className="text-center p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-viverblue animate-pulse" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>

        {/* Solutions Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          {[1, 2].map((i) => (
            <div key={i} className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="bg-viverblue/10 border border-viverblue/20 rounded p-2">
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Lessons Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          {[1, 2].map((i) => (
            <div key={i} className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <span className="text-neutral-400">•</span>
                    <Skeleton className="h-4 w-20" />
                    <span className="text-neutral-400">•</span>
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="bg-viverblue/10 border border-viverblue/20 rounded p-2">
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-6 border-t border-neutral-700/50 mt-6">
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
