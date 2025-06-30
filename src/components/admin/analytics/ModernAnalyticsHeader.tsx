
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Settings, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Analytics
            </h1>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Ao Vivo
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="hidden sm:flex"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSettings}
            className="hidden sm:flex"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Totais</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Soluções</p>
                <p className="text-2xl font-bold">{totalSolutions.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{totalCourses.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(lastUpdated, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
