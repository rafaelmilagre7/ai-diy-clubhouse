
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mail, Bell, Eye, MousePointer, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCommunications } from '@/hooks/admin/useCommunications';

interface CommunicationStatsProps {
  communicationId: string;
  onClose: () => void;
}

export const CommunicationStats: React.FC<CommunicationStatsProps> = ({
  communicationId,
  onClose,
}) => {
  const { getDeliveryStats } = useCommunications();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['communication-stats', communicationId],
    queryFn: () => getDeliveryStats(communicationId),
  });

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Estatísticas do Comunicado</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalDeliveries = Object.values(stats || {}).reduce((acc: any, channel: any) => acc + channel.total, 0);
  const totalDelivered = Object.values(stats || {}).reduce((acc: any, channel: any) => acc + channel.delivered, 0);
  const deliveryRate = totalDeliveries > 0 ? (totalDelivered / totalDeliveries) * 100 : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-modal-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estatísticas do Comunicado</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Enviado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDeliveries}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
                <Progress value={deliveryRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <div className="text-xs text-muted-foreground">Em desenvolvimento</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <div className="text-xs text-muted-foreground">Em desenvolvimento</div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por Canal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estatísticas por Canal</h3>
            
            {stats && Object.entries(stats).map(([channel, data]: [string, any]) => {
              const successRate = data.total > 0 ? (data.delivered / data.total) * 100 : 0;
              const pendingRate = data.total > 0 ? (data.pending / data.total) * 100 : 0;
              const failedRate = data.total > 0 ? (data.failed / data.total) * 100 : 0;

              return (
                <Card key={channel}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {channel === 'notification' && <Bell className="w-5 h-5" />}
                      {channel === 'email' && <Mail className="w-5 h-5" />}
                      {channel === 'notification' ? 'Notificação In-App' : 
                       channel === 'email' ? 'E-mail' : 'WhatsApp'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-xl font-bold">{data.total}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Entregues</div>
                        <div className="text-xl font-bold text-status-success">{data.delivered}</div>
                        <Badge variant="secondary" className="text-xs">
                          {successRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Pendentes</div>
                        <div className="text-xl font-bold text-status-warning">{data.pending}</div>
                        <Badge variant="secondary" className="text-xs">
                          {pendingRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Falhas</div>
                        <div className="text-xl font-bold text-status-error">{data.failed}</div>
                        <Badge variant="destructive" className="text-xs">
                          {failedRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">Taxa de Sucesso</div>
                      <Progress value={successRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gráfico Temporal (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Entregas ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Gráfico temporal em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
