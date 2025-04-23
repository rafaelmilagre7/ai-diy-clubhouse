import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Componentes padronizados para estados de loading
 * Estes componentes garantem uma experiência de usuário consistente
 */

export const LoadingSpinner = ({ 
  size = "default", 
  className 
}: { 
  size?: "sm" | "default" | "lg" | "xl",
  className?: string 
}) => {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };
  
  return (
    <Loader2 
      className={cn("animate-spin text-viverblue", sizeClass[size], className)}
      aria-label="Carregando..."
    />
  );
};

export const LoadingOverlay = ({ 
  message = "Carregando dados..." 
}: { 
  message?: string 
}) => {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
};

export const LoadingPage = ({ 
  message = "Carregando", 
  description 
}: { 
  message?: string, 
  description?: string 
}) => {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center">
      <LoadingSpinner size="xl" />
      <h2 className="text-xl font-semibold text-foreground mt-4 mb-2">{message}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {description}
        </p>
      )}
    </div>
  );
};

// Esqueleto de card para soluções
export const SolutionCardSkeleton = () => (
  <div className="border rounded-lg shadow-sm overflow-hidden">
    <Skeleton className="h-[160px] w-full" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-3 w-[80px]" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
    </div>
  </div>
);

// Grid de esqueletos para soluções
export const SolutionsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SolutionCardSkeleton key={i} />
    ))}
  </div>
);
