import { CheckCircle, Clock, TrendingUp, Zap } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasActiveProjects = inProgress > 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Card de Implementações Completas */}
      <Card className="border-viverblue/20 bg-gradient-to-br from-card to-viverblue/5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-6 relative">
          {/* Efeito de brilho */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-viverblue/10 rounded-full filter blur-2xl"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="rounded-xl bg-viverblue/10 border border-viverblue/20 p-3 group-hover:bg-viverblue/20 transition-colors duration-300">
              <CheckCircle className="h-6 w-6 text-viverblue" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Implementações Completas</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{completed}</p>
                <span className="text-sm text-muted-foreground">de {total}</span>
              </div>
              {/* Barra de progresso */}
              <div className="w-full h-2 bg-background/50 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-viverblue to-viverblue-light rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-viverblue font-medium mt-1">{completionRate}% concluído</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Card de Em Andamento */}
      <Card className="border-operational/20 bg-gradient-to-br from-card to-operational/5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardContent className="p-6 relative">
          {/* Efeito de brilho */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-operational/10 rounded-full filter blur-2xl"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="rounded-xl bg-operational/10 border border-operational/20 p-3 group-hover:bg-operational/20 transition-colors duration-300">
              <Clock className="h-6 w-6 text-operational" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Em Andamento</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{inProgress}</p>
                <span className="text-sm text-muted-foreground">projetos</span>
              </div>
              {/* Indicador visual de atividade */}
              <div className="flex items-center gap-1 mt-3">
                {hasActiveProjects ? (
                  <>
                    <div className="flex space-x-1">
                      {[...Array(Math.min(5, inProgress))].map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-2 rounded-full bg-operational/70 transition-all duration-300", 
                            i < 3 ? "w-8" : "w-4"
                          )}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs text-operational font-medium ml-2">Ativo</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-full rounded-full bg-background/50"></div>
                    <span className="text-xs text-muted-foreground ml-2">Inativo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Progresso Total */}
      <Card className="border-strategy/20 bg-gradient-to-br from-card to-strategy/5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group sm:col-span-2 lg:col-span-1">
        <CardContent className="p-6 relative">
          {/* Efeito de brilho */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-strategy/10 rounded-full filter blur-2xl"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="rounded-xl bg-strategy/10 border border-strategy/20 p-3 group-hover:bg-strategy/20 transition-colors duration-300">
              <TrendingUp className="h-6 w-6 text-strategy" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Progresso Geral</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <span className="text-sm text-muted-foreground">soluções</span>
              </div>
              {/* Status badge */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-strategy" />
                  <span className="text-xs font-medium text-strategy">
                    {completed > 0 ? 'Progredindo' : 'Iniciando jornada'}
                  </span>
                </div>
                {total > 0 && (
                  <div className="text-xs text-muted-foreground">
                    • {Math.round((inProgress / total) * 100)}% ativo
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};