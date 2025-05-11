
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="rounded-xl overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-300"></div>
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 p-3 transition-all duration-300 group-hover:scale-110">
              <CheckCircle className="h-7 w-7 text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-md text-neutral-600 dark:text-neutral-300 mb-1 font-medium">Implementações Completas</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-heading">{completed}</p>
                <span className="text-xs ml-2 text-neutral-500 dark:text-neutral-400">de {total}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-xl overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-viverblue via-viverblue-light to-indigo-400"></div>
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-gradient-to-br from-viverblue/10 to-viverblue/5 dark:from-viverblue/20 dark:to-viverblue/10 p-3 transition-all duration-300 group-hover:scale-110">
              <Clock className="h-7 w-7 text-viverblue dark:text-viverblue-light" />
            </div>
            <div>
              <h3 className="text-md text-neutral-600 dark:text-neutral-300 mb-1 font-medium">Em Andamento</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white font-heading">{inProgress}</p>
                <span className="text-xs ml-2 text-neutral-500 dark:text-neutral-400">soluções</span>
              </div>
              <div className="flex space-x-1 mt-2">
                {[...Array(Math.min(5, inProgress))].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full bg-viverblue", 
                      i < 3 ? "w-8" : "w-4",
                      i === 0 && "animate-pulse"
                    )}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-xl overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"></div>
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-6">
            <div className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 p-3 transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-md text-neutral-600 dark:text-neutral-300 mb-1 font-medium">Seu Progresso</h3>
              <div className="relative">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-heading">{percent}%</p>
                <div className="absolute top-0 right-0 rounded-full bg-indigo-100 dark:bg-indigo-900/20 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-300">
                  {percent >= 75 ? "Excelente" : percent >= 50 ? "Bom" : "Iniciante"}
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-in-out"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
