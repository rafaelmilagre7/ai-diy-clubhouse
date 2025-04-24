
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Implementation } from "@/hooks/useProfileData";
import { UserStats } from "@/hooks/useUserStats/types";

interface StatsTabContentProps {
  stats: UserStats;
  implementations: Implementation[];
}

export const StatsTabContent = ({ stats, implementations }: StatsTabContentProps) => {
  const recentImplementations = [...implementations]
    .sort((a, b) => new Date(b.last_activity || '').getTime() - new Date(a.last_activity || '').getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Implementação</CardTitle>
        <CardDescription>
          Uma visão geral do seu progresso na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Distribuição por Categoria</h4>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-revenue">Aumento de Receita</span>
                    <span>{stats.categoryDistribution.revenue.completed}/{stats.categoryDistribution.revenue.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.revenue.total > 0 ? 
                      (stats.categoryDistribution.revenue.completed / stats.categoryDistribution.revenue.total) * 100 : 0
                    } 
                    className="h-2 bg-muted" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-operational">Otimização Operacional</span>
                    <span>{stats.categoryDistribution.operational.completed}/{stats.categoryDistribution.operational.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.operational.total > 0 ? 
                      (stats.categoryDistribution.operational.completed / stats.categoryDistribution.operational.total) * 100 : 0
                    } 
                    className="h-2 bg-muted" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-strategy">Gestão Estratégica</span>
                    <span>{stats.categoryDistribution.strategy.completed}/{stats.categoryDistribution.strategy.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.strategy.total > 0 ? 
                      (stats.categoryDistribution.strategy.completed / stats.categoryDistribution.strategy.total) * 100 : 0
                    } 
                    className="h-2 bg-muted" 
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Tempo Gasto</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{stats.totalTimeSpent || 0}</p>
                    <p className="text-xs text-muted-foreground">minutos totais</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">{stats.avgTimePerSolution || 0}</p>
                    <p className="text-xs text-muted-foreground">min. por solução</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Atividade Recente</h4>
              <div className="mt-2 space-y-3">
                {recentImplementations.length > 0 ? (
                  recentImplementations.map((implementation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-viverblue/10 flex items-center justify-center">
                        {implementation.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-viverblue" />
                        ) : (
                          <Clock className="h-4 w-4 text-viverblue" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {implementation.is_completed ? "Implementação concluída" : "Implementação em andamento"}
                        </p>
                        <p className="text-xs text-muted-foreground">{implementation.solution?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(implementation.last_activity || '')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade recente encontrada
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Próximos Passos Recomendados</h4>
              <div className="mt-2 space-y-2">
                {implementations.some(imp => !imp.is_completed) ? (
                  <Card className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Concluir implementação atual</p>
                        <p className="text-xs text-muted-foreground">
                          {implementations.find(imp => !imp.is_completed)?.solution?.title}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/implement/${implementations.find(imp => !imp.is_completed)?.solution?.id}/${implementations.find(imp => !imp.is_completed)?.current_module}`}>
                          Continuar
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Explore novas soluções</p>
                        <p className="text-xs text-muted-foreground">
                          Descubra soluções que podem ajudar seu negócio
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/dashboard">
                          Explorar
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}
                
                {stats.categoryDistribution.strategy.completed === 0 && (
                  <Card className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Explore a trilha de estratégia</p>
                        <p className="text-xs text-muted-foreground">Ainda não implementou soluções desta trilha</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/dashboard?category=strategy">
                          Explorar
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
