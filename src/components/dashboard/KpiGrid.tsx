
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";

interface KpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

export const KpiGrid = ({ completed, inProgress, total, isLoading = false }: KpiGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-4 shadow-sm">
            <Skeleton className="h-6 w-6 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col">
          <div className="text-muted-foreground mb-1">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">{completed}</div>
          <div className="text-sm text-muted-foreground">Soluções completas</div>
        </div>
      </div>
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col">
          <div className="text-muted-foreground mb-1">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">{inProgress}</div>
          <div className="text-sm text-muted-foreground">Em andamento</div>
        </div>
      </div>
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col">
          <div className="text-muted-foreground mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Total disponível</div>
        </div>
      </div>
    </div>
  );
};
