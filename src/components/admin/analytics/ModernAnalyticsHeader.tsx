
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Settings, Clock, TrendingUp, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOptimizedAnalyticsContext } from './providers/OptimizedAnalyticsProvider';

interface ModernAnalyticsHeaderProps {
  lastUpdated?: Date;
  onRefresh: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  totalUsers?: number;
  totalSolutions?: number;
  totalCourses?: number;
}

export const ModernAnalyticsHeader = ({
  lastUpdated = new Date(),
  onRefresh,
  onExport,
  onSettings,
  isLoading = false,
  totalUsers = 0,
  totalSolutions = 0,
  totalCourses = 0
}: ModernAnalyticsHeaderProps) => {
  const { 
    isOptimizationEnabled, 
    cacheEnabled,
    getPerformanceStats
  } = useOptimizedAnalyticsContext();

  // Obter estatísticas de performance
  const stats = getPerformanceStats();

  return (
    <div className="space-y-6">
      {/* Breadcrumb e Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Administração</span>
            <span>/</span>
            <span className="text-foreground font-medium">Analytics</span>
          </nav>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard Analytics
            </h1>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              Ao Vivo
            </Badge>
            {isOptimizationEnabled && (
              <Badge variant="outline" className="bg-operational/10 text-operational border-operational/20">
                <Zap className="w-3 h-3 mr-1" />
                Otimizado
              </Badge>
            )}
            {cacheEnabled && stats && (
              <Badge variant="outline" className="bg-strategy/10 text-strategy border-strategy/20">
                Cache: {stats.hitRate}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="hidden sm:flex bg-card border-border hover:bg-accent"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSettings}
            className="hidden sm:flex bg-card border-border hover:bg-accent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-card border-border hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-operational bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Totais</p>
                <p className="text-2xl font-bold text-card-foreground">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-operational/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-operational" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Soluções</p>
                <p className="text-2xl font-bold text-card-foreground">{totalSolutions.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-strategy bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold text-card-foreground">{totalCourses.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-strategy/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-strategy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-medium flex items-center text-card-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(lastUpdated, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
