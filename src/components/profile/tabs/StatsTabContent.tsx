
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart, Clock, CheckCircle, TrendingUp, Settings, ChevronRight } from "lucide-react";
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
    <Card className="glass-dark">
      <CardHeader>
        <CardTitle className="text-high-contrast">Estatísticas de Implementação</CardTitle>
        <CardDescription className="text-medium-contrast">
          Uma visão geral do seu progresso na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-elevated p-4 rounded-lg border border-border animate-fade-in">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-aurora-primary" />
                Distribuição por Categoria
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-operational font-medium flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                      Aumento de Receita
                    </span>
                    <span className="font-medium text-white">{stats.categoryDistribution.Receita.completed}/{stats.categoryDistribution.Receita.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.Receita.total > 0 ? 
                      (stats.categoryDistribution.Receita.completed / stats.categoryDistribution.Receita.total) * 100 : 0
                    } 
                    className="h-2"
                    style={{
                      background: 'var(--category-receita-bg)'
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cyan-400 font-medium flex items-center">
                      <Settings className="h-3.5 w-3.5 mr-1.5" />
                      Otimização Operacional
                    </span>
                    <span className="font-medium text-white">{stats.categoryDistribution.Operacional.completed}/{stats.categoryDistribution.Operacional.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.Operacional.total > 0 ? 
                      (stats.categoryDistribution.Operacional.completed / stats.categoryDistribution.Operacional.total) * 100 : 0
                    } 
                    className="h-2"
                    style={{
                      background: 'var(--category-operacional-bg)'
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-400 font-medium flex items-center">
                      <BarChart className="h-3.5 w-3.5 mr-1.5" />
                      Gestão Estratégica
                    </span>
                    <span className="font-medium text-white">{stats.categoryDistribution.Estratégia.completed}/{stats.categoryDistribution.Estratégia.total}</span>
                  </div>
                  <Progress 
                    value={stats.categoryDistribution.Estratégia.total > 0 ? 
                      (stats.categoryDistribution.Estratégia.completed / stats.categoryDistribution.Estratégia.total) * 100 : 0
                    } 
                    className="h-2"
                    style={{
                      background: 'var(--category-estrategia-bg)'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-surface-elevated p-4 rounded-lg border border-border animate-fade-in">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-aurora-primary" />
                Tempo de Uso
              </h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Card className="dark-mode-card border-aurora-primary/10 hover:border-aurora-primary/30 transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-high-contrast">{stats.totalTimeSpent || 0}</p>
                    <p className="text-xs text-medium-contrast">minutos totais</p>
                  </CardContent>
                </Card>
                <Card className="dark-mode-card border-aurora-primary/10 hover:border-aurora-primary/30 transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-high-contrast">{stats.avgTimePerSolution || 0}</p>
                    <p className="text-xs text-medium-contrast">min. por solução</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-elevated p-4 rounded-lg border border-border animate-fade-in">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-aurora-primary" />
                Atividade Recente
              </h4>
              <div className="mt-2 space-y-3">
                {recentImplementations.length > 0 ? (
                  recentImplementations.map((implementation, index) => (
                    <div key={index} className="flex items-start gap-3 bg-card p-3 rounded-lg border border-border hover:border-aurora-primary/30 transition-all duration-300">
                      <div className="h-8 w-8 rounded-full bg-aurora-primary/10 flex items-center justify-center">
                        {implementation.is_completed ? (
                          <CheckCircle className="h-4 w-4 text-aurora-primary" />
                        ) : (
                          <Clock className="h-4 w-4 text-aurora-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-high-contrast">
                          {implementation.is_completed ? "Implementação concluída" : "Implementação em andamento"}
                        </p>
                        <p className="text-xs text-medium-contrast">{implementation.solution?.title}</p>
                        <p className="text-xs text-medium-contrast">
                          {formatDate(implementation.last_activity || '')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-medium-contrast">
                      Nenhuma atividade recente encontrada
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-surface-elevated p-4 rounded-lg border border-border animate-fade-in">
              <h4 className="text-sm font-medium text-white mb-3">
                Próximos Passos Recomendados
              </h4>
              <div className="mt-2 space-y-3">
                {implementations.some(imp => !imp.is_completed) ? (
                  <Card className="p-3 dark-mode-card hover:shadow-md transition-all border-aurora-primary/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-high-contrast">
                          Concluir implementação atual
                        </p>
                        <p className="text-xs text-medium-contrast">
                          {implementations.find(imp => !imp.is_completed)?.solution?.title}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        asChild
                        className="hover:bg-aurora-primary/10 hover:text-aurora-primary"
                      >
                        <Link 
                          to={`/implement/${implementations.find(imp => !imp.is_completed)?.solution?.id}/${implementations.find(imp => !imp.is_completed)?.current_module}`}
                          className="flex items-center"
                        >
                          Continuar
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-3 dark-mode-card hover:shadow-md transition-all border-aurora-primary/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-high-contrast">
                          Explore novas soluções
                        </p>
                        <p className="text-xs text-medium-contrast">
                          Descubra soluções que podem ajudar seu negócio
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        asChild
                        className="hover:bg-aurora-primary/10 hover:text-aurora-primary"
                      >
                        <Link to="/solutions" className="flex items-center">
                          Explorar
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}
                
                {stats.categoryDistribution.Estratégia.completed === 0 && (
                  <Card className="p-3 dark-mode-card hover:shadow-md transition-all border-aurora-primary/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-high-contrast">
                          Explore soluções estratégicas
                        </p>
                        <p className="text-xs text-medium-contrast">
                          Ainda não implementou soluções desta categoria
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        asChild
                        className="hover:bg-aurora-primary/10 hover:text-aurora-primary"
                      >
                        <Link to="/solutions?category=strategy" className="flex items-center">
                          Explorar
                          <ChevronRight className="ml-1 h-4 w-4" />
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
