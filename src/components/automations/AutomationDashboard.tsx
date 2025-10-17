import { useState } from "react";
import { Activity, BarChart3, Clock, PlayCircle, PauseCircle, AlertTriangle, TrendingUp, Users, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAutomationRules } from "@/hooks/useAutomationRules";
import { useAutomationLogStats } from "@/hooks/useAutomationLogs";
import { Progress } from "@/components/ui/progress";

interface AutomationDashboardProps {
  onCreateRule: () => void;
  onViewLogs: () => void;
  onViewRules: () => void;
}

export const AutomationDashboard = ({ onCreateRule, onViewLogs, onViewRules }: AutomationDashboardProps) => {
  const { data: rules } = useAutomationRules();
  const { data: logStats } = useAutomationLogStats();

  const stats = {
    total: rules?.length || 0,
    active: rules?.filter(r => r.is_active).length || 0,
    inactive: rules?.filter(r => !r.is_active).length || 0,
    webhook: rules?.filter(r => r.rule_type === 'webhook').length || 0,
    scheduled: rules?.filter(r => r.rule_type === 'schedule').length || 0,
  };

  const successRate = logStats?.total ? ((logStats.success / logStats.total) * 100) : 0;
  const avgExecutionTime = 245; // Mock data - replace with real data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações</h1>
          <p className="text-muted-foreground">
            Centro de controle inteligente para suas automações
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onViewLogs}>
            <Activity className="mr-2 h-4 w-4" />
            Logs
          </Button>
          <Button onClick={onCreateRule} className="bg-gradient-to-r from-primary to-primary/80">
            <Zap className="mr-2 h-4 w-4" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Regras</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.active} ativas • {stats.inactive} inativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-system-healthy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-system-healthy">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {logStats?.success || 0} sucessos nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
            <Activity className="h-4 w-4 text-status-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-info">{logStats?.total || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-system-healthy rounded-full"></div>
                <span className="text-xs text-system-healthy">{logStats?.success || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-status-error rounded-full"></div>
                <span className="text-xs text-status-error">{logStats?.failed || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-status-warning rounded-full"></div>
                <span className="text-xs text-status-warning">{logStats?.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-operational" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-operational">{avgExecutionTime}ms</div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-performance-excellent rounded-full mr-2"></div>
              <p className="text-xs text-muted-foreground">
                Performance otimizada
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-4"
              onClick={onCreateRule}
            >
              <div className="flex items-start gap-3">
                <PlayCircle className="h-5 w-5 text-system-healthy mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Criar Nova Regra</div>
                  <div className="text-sm text-muted-foreground">
                    Use templates ou crie do zero
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-4"
              onClick={onViewRules}
            >
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-status-info mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Gerenciar Regras</div>
                  <div className="text-sm text-muted-foreground">
                    Editar e organizar automações
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start h-auto p-4"
              onClick={onViewLogs}
            >
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-operational mt-0.5" />
                <div className="text-left">
                  <div className="font-medium">Monitorar Execuções</div>
                  <div className="text-sm text-muted-foreground">
                    Ver logs e diagnosticar problemas
                  </div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visão Geral do Sistema
            </CardTitle>
            <CardDescription>
              Status das suas automações por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Webhooks
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.webhook} regras
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-3 w-3 text-system-healthy" />
                  <span className="text-xs text-system-healthy">Ativo</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Agendadas
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stats.scheduled} regras
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-status-info" />
                  <span className="text-xs text-status-info">Programado</span>
                </div>
              </div>

              {logStats?.failed > 0 && (
                <div className="flex items-center justify-between p-2 bg-status-error-lighter rounded-lg border border-status-error/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-status-error" />
                    <span className="text-sm text-status-error">
                      {logStats.failed} falhas recentes
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onViewLogs}>
                    Investigar
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                Sistema funcionando normalmente
              </div>
              <div className="text-xs text-system-healthy flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-system-healthy rounded-full"></div>
                Última execução há 2 minutos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};