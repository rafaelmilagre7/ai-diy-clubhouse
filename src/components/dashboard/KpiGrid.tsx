
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  completed: number;
  inProgress: number;
  total: number;
  isLoading?: boolean;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ 
  completed, 
  inProgress, 
  total,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="border border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-full bg-white/5 p-3">
            <CheckCircle className="h-5 w-5 text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm text-neutral-400 mb-1">Implementações Completas</h3>
            <div className="flex items-baseline">
              <p className="text-xl font-medium text-white">{completed}</p>
              <span className="text-xs ml-1.5 text-neutral-500">de {total}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-neutral-500 rounded-full" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-full bg-white/5 p-3">
            <Clock className="h-5 w-5 text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm text-neutral-400 mb-1">Em Andamento</h3>
            <div className="flex items-baseline">
              <p className="text-xl font-medium text-white">{inProgress}</p>
              <span className="text-xs ml-1.5 text-neutral-500">projetos</span>
            </div>
            <div className="flex space-x-1 mt-2">
              {[...Array(Math.min(5, inProgress))].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 rounded-full bg-neutral-500", 
                    i < 3 ? "w-6" : "w-3"
                  )}
                ></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="rounded-full bg-white/5 p-3">
            <TrendingUp className="h-5 w-5 text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm text-neutral-400 mb-1">Seu Progresso</h3>
            <div className="relative">
              <p className="text-xl font-medium text-white">{percent}%</p>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-neutral-500 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
