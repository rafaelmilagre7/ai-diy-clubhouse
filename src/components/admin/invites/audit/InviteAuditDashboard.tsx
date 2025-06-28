
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Users, Clock, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useInviteAudit } from '@/hooks/admin/invites/useInviteAudit';
import { Badge } from '@/components/ui/badge';

interface InviteAuditDashboardProps {
  timeRange?: string;
}

export const InviteAuditDashboard: React.FC<InviteAuditDashboardProps> = ({ 
  timeRange = '30d' 
}) => {
  const { 
    metrics, 
    loading, 
    error, 
    runAudit, 
    isAuditing 
  } = useInviteAudit(timeRange);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erro na Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={runAudit} disabled={isAuditing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const actionTypeEntries = Object.entries(metrics.actionsByType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Auditoria de Convites</h2>
          <p className="text-muted-foreground">
            Monitoramento de atividades relacionadas aos convites
          </p>
        </div>
        <Button onClick={runAudit} disabled={isAuditing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? 'animate-spin' : ''}`} />
          {isAuditing ? 'Auditando...' : 'Executar Auditoria'}
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange === '7d' ? '7 dias' : timeRange === '30d' ? '30 dias' : '90 dias'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Ação</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionTypeEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes tipos de ações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Recentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentActions.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 20 ações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={metrics.totalActions > 0 ? "default" : "secondary"}>
              {metrics.totalActions > 0 ? "Ativo" : "Inativo"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema de auditoria
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.actionsTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="actions" 
                  stroke="#00EAD9" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionTypeEntries.map(([type, count]) => ({ type, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00EAD9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentActions.length > 0 ? (
            <div className="space-y-4">
              {metrics.recentActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{action.action_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(action.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      Usuário: {action.user_id || 'Sistema'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma ação recente encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
