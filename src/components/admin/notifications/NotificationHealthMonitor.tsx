import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Bell, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationHealth {
  total_notifications: number;
  unread_notifications: number;
  notifications_last_24h: number;
  pending_event_reminders: number;
  cron_job_active: boolean;
  timestamp: string;
}

export const NotificationHealthMonitor = () => {
  const { data: health, isLoading, refetch } = useQuery({
    queryKey: ['notification-health'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_notifications_health');
      if (error) throw error;
      return data as NotificationHealth;
    },
    refetchInterval: 60000, // Atualizar a cada 1 minuto
  });

  const testNotification = async () => {
    try {
      const { data, error } = await supabase.rpc('test_notification_system', {
        p_type: 'test'
      });
      
      if (error) throw error;
      
      toast.success('Notificação de teste criada!', {
        description: 'Verifique o sino de notificações'
      });
      
      refetch();
    } catch (error: any) {
      toast.error('Erro ao criar notificação de teste: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const metrics = [
    {
      label: 'Total de Notificações',
      value: health.total_notifications,
      icon: Bell,
      color: 'text-aurora-primary',
      bgColor: 'bg-aurora-primary/10',
    },
    {
      label: 'Não Lidas',
      value: health.unread_notifications,
      icon: Activity,
      color: 'text-status-warning',
      bgColor: 'bg-status-warning/10',
    },
    {
      label: 'Últimas 24h',
      value: health.notifications_last_24h,
      icon: Clock,
      color: 'text-aurora-secondary',
      bgColor: 'bg-aurora-secondary/10',
    },
    {
      label: 'Lembretes Pendentes',
      value: health.pending_event_reminders,
      icon: Clock,
      color: 'text-textSecondary',
      bgColor: 'bg-surface-elevated',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-surface border-border shadow-elegant">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-textPrimary flex items-center gap-2">
                <Activity className="h-5 w-5 text-aurora-primary" />
                Status do Sistema de Notificações
              </CardTitle>
              <CardDescription className="text-textSecondary mt-1">
                Monitoramento em tempo real do sistema de notificações automáticas
              </CardDescription>
            </div>
            
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-border hover:bg-surface-elevated"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Status do Cron Job */}
          <div className={cn(
            "mb-6 p-4 rounded-lg border-2 transition-all duration-fast",
            health.cron_job_active 
              ? "bg-status-success/10 border-status-success/30" 
              : "bg-status-error/10 border-status-error/30"
          )}>
            <div className="flex items-center gap-3">
              <CheckCircle className={cn(
                "h-6 w-6",
                health.cron_job_active ? "text-status-success" : "text-status-error"
              )} />
              <div>
                <h3 className="font-semibold text-textPrimary">
                  Cron Job de Lembretes
                </h3>
                <p className="text-sm text-textSecondary">
                  {health.cron_job_active 
                    ? '✅ Ativo - Executando a cada 15 minutos' 
                    : '❌ Inativo - Configure o cron job'}
                </p>
              </div>
              <Badge 
                variant={health.cron_job_active ? "default" : "destructive"}
                className="ml-auto"
              >
                {health.cron_job_active ? 'ATIVO' : 'INATIVO'}
              </Badge>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={cn(
                    "p-4 rounded-lg border border-border transition-all duration-fast hover:shadow-glow-sm",
                    metric.bgColor
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("h-5 w-5", metric.color)} />
                    <span className={cn("text-2xl font-bold", metric.color)}>
                      {metric.value}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-textSecondary">
                    {metric.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Ações */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={testNotification}
              variant="outline"
              className="border-aurora-primary text-aurora-primary hover:bg-aurora-primary/10"
            >
              🧪 Testar Notificação
            </Button>
            
            <Button
              onClick={() => window.open('/admin/notifications/stats', '_blank')}
              variant="outline"
              className="border-border hover:bg-surface-elevated"
            >
              📊 Ver Estatísticas Completas
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-textSecondary/60 mt-4 text-right">
            Última atualização: {new Date(health.timestamp).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
