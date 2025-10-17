import React from 'react';

export const LessonLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5">
      <div className="absolute inset-0" style={{ backgroundImage: 'var(--gradient-radial-purple)' }} />
      <div className="relative">
        <div className="container py-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex items-center mb-6">
            <div className="w-32 h-10 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-lg animate-pulse shimmer-gradient animate-shimmer"></div>
          </div>
          
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-20 h-4 bg-muted/50 rounded animate-pulse"></div>
            <div className="w-1 h-1 bg-muted/30 rounded-full"></div>
            <div className="w-32 h-4 bg-muted/50 rounded animate-pulse"></div>
            <div className="w-1 h-1 bg-muted/30 rounded-full"></div>
            <div className="w-24 h-4 bg-muted/50 rounded animate-pulse"></div>
          </div>
          
          {/* Lesson Header Skeleton */}
          <div className="mb-8">
            <div className="w-3/4 h-8 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 rounded-lg mb-4 animate-pulse shimmer-gradient animate-shimmer"></div>
            <div className="w-1/2 h-6 bg-muted/50 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Video Player Skeleton with minimum height */}
          <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl min-h-[400px]">
            <div className="w-full aspect-video bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 rounded-xl animate-pulse flex items-center justify-center relative overflow-hidden">
              {/* Play button skeleton */}
              <div className="w-16 h-16 bg-muted/40 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-6 h-6 bg-muted/60 rounded-sm animate-pulse"></div>
              </div>
              
              {/* Video controls skeleton */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted/40 rounded-full animate-pulse"></div>
                <div className="flex-1 h-2 bg-muted/40 rounded-full animate-pulse"></div>
                <div className="w-12 h-4 bg-muted/40 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Tabs Skeleton */}
            <div className="space-y-6 mt-8">
              <div className="flex space-x-4 border-b border-border">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-24 h-10 bg-muted/50 rounded-t-lg animate-pulse"></div>
                ))}
              </div>
              
              {/* Tab content skeleton */}
              <div className="space-y-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-4 bg-muted/50 rounded animate-pulse ${
                      i === 4 ? 'w-2/3' : 'w-full'
                    }`}></div>
                  ))}
                </div>
                
                {/* Resources skeleton */}
                <div className="grid gap-4 mt-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <div className="w-10 h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-3/4 h-4 bg-muted/50 rounded mb-2 animate-pulse"></div>
                        <div className="w-1/2 h-3 bg-muted/40 rounded animate-pulse"></div>
                      </div>
                      <div className="w-20 h-8 bg-muted/50 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Skeleton */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between items-center">
                  <div className="w-32 h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                  <div className="w-32 h-10 bg-muted/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};