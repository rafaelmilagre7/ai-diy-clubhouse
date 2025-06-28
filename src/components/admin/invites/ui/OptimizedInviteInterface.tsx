
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, Filter } from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/admin/invites/useOptimizedAnalytics';

export const OptimizedInviteInterface = () => {
  const {
    analytics,
    loading,
    error,
    refetch,
    filters,
    updateFilters,
    exportData
  } = useOptimizedAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar dados: {error}</p>
          <Button onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary metrics from analytics data
  const totalInvites = analytics.reduce((sum, period) => sum + period.invitesSent, 0);
  const averageAcceptance = analytics.length > 0 
    ? analytics.reduce((sum, period) => sum + period.acceptanceRate, 0) / analytics.length 
    : 0;
  const lastPeriodInvites = analytics[analytics.length - 1]?.invitesSent || 0;
  const conversionRate = averageAcceptance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Otimizados</h2>
          <p className="text-muted-foreground">Análise avançada de convites e conversões</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Convites</p>
                <p className="text-2xl font-bold">{totalInvites}</p>
              </div>
              <Badge variant="secondary">{totalInvites > 0 ? '+' : ''}{totalInvites}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aceitação</p>
                <p className="text-2xl font-bold">{averageAcceptance.toFixed(1)}%</p>
              </div>
              <Badge variant={averageAcceptance > 50 ? "default" : "secondary"}>
                {averageAcceptance > 50 ? "Bom" : "Médio"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Último Período</p>
                <p className="text-2xl font-bold">{lastPeriodInvites}</p>
              </div>
              <Badge variant="outline">{filters.dateRange}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              </div>
              <Badge variant={conversionRate > 30 ? "default" : "secondary"}>
                {conversionRate > 30 ? "Ótimo" : "Regular"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Convites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{period.period}</p>
                  <p className="text-sm text-muted-foreground">
                    {period.invitesSent} convites enviados
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{period.acceptanceRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">taxa de aceitação</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
