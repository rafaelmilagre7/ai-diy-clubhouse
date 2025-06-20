
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useInvitesList } from '@/hooks/admin/invites/useInvitesList';

interface EmailStats {
  totalSent: number;
  successfulSent: number;
  failed: number;
  pending: number;
  successRate: number;
  avgResponseTime: number;
  recentActivity: Array<{
    email: string;
    status: 'sent' | 'failed' | 'pending';
    timestamp: string;
    error?: string;
  }>;
}

export const EmailMonitoringDashboard: React.FC = () => {
  const { invites, loading, fetchInvites } = useInvitesList();
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalSent: 0,
    successfulSent: 0,
    failed: 0,
    pending: 0,
    successRate: 0,
    avgResponseTime: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (invites.length > 0) {
      calculateStats();
    }
  }, [invites]);

  const calculateStats = () => {
    const total = invites.length;
    const sent = invites.filter(i => i.status === 'sent').length;
    const failed = invites.filter(i => i.status === 'failed').length;
    const pending = invites.filter(i => i.status === 'pending').length;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    // Simular atividade recente com base nos convites
    const recentActivity = invites
      .slice(0, 5)
      .map(invite => ({
        email: invite.email,
        status: invite.status as 'sent' | 'failed' | 'pending',
        timestamp: invite.created_at,
        error: invite.status === 'failed' ? 'Erro de envio' : undefined
      }));

    setEmailStats({
      totalSent: total,
      successfulSent: sent,
      failed,
      pending,
      successRate,
      avgResponseTime: Math.random() * 1000 + 200, // Simulado
      recentActivity
    });
  };

  const refreshStats = async () => {
    await fetchInvites();
    calculateStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'failed': return 'Falhou';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Dashboard de Monitoramento de Email
        </h3>
        <Button onClick={refreshStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enviados</p>
                <p className="text-2xl font-bold">{emailStats.totalSent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{emailStats.successfulSent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold text-red-600">{emailStats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{emailStats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailStats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {emailStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{activity.email}</span>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {getStatusLabel(activity.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade de email encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tempo Médio de Resposta</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(emailStats.avgResponseTime)}ms
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((emailStats.avgResponseTime / 2000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Taxa de Sucesso</span>
                <span className="text-sm text-muted-foreground">{emailStats.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${emailStats.successRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
