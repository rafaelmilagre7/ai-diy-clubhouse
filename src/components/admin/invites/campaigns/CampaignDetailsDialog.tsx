
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  MessageSquare,
  Calendar,
  Target,
  Clock
} from 'lucide-react';
import type { InviteCampaign } from '@/hooks/admin/invites/useCampaignManagement';

interface CampaignDetailsDialogProps {
  campaign: InviteCampaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignDetailsDialog: React.FC<CampaignDetailsDialogProps> = ({
  campaign,
  open,
  onOpenChange
}) => {
  const getStatusBadge = (status: InviteCampaign['status']) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      paused: 'outline',
      completed: 'default'
    } as const;

    const labels = {
      draft: 'Rascunho',
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída'
    };

    return (
      <Badge variant={variants[status]} className={
        status === 'active' ? 'bg-green-500 hover:bg-green-600' :
        status === 'paused' ? 'bg-yellow-500 hover:bg-yellow-600' :
        status === 'completed' ? 'bg-blue-500 hover:bg-blue-600' : ''
      }>
        {labels[status]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{campaign.name}</span>
            {getStatusBadge(campaign.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Campanha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.description && (
                <div>
                  <h4 className="font-medium mb-1">Descrição</h4>
                  <p className="text-muted-foreground">{campaign.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Papel Alvo</h4>
                  <p className="text-muted-foreground">{campaign.targetRoleName || campaign.targetRole}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Canais</h4>
                  <div className="flex items-center space-x-2">
                    {campaign.channels.includes('email') && <Mail className="w-4 h-4" />}
                    {campaign.channels.includes('whatsapp') && <MessageSquare className="w-4 h-4" />}
                    <span className="text-muted-foreground">{campaign.channels.join(' + ')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Criada em</h4>
                  <p className="text-muted-foreground">{formatDate(campaign.createdAt)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Última Atualização</h4>
                  <p className="text-muted-foreground">{formatDate(campaign.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Convites"
              value={campaign.metrics.totalInvites.toLocaleString()}
              icon={Users}
              subtitle="Criados na campanha"
            />
            <MetricCard
              title="Enviados"
              value={campaign.metrics.sent.toLocaleString()}
              icon={Mail}
              subtitle={`${campaign.metrics.totalInvites > 0 ? ((campaign.metrics.sent / campaign.metrics.totalInvites) * 100).toFixed(1) : 0}% do total`}
            />
            <MetricCard
              title="Cadastros"
              value={campaign.metrics.registered.toLocaleString()}
              icon={Target}
              subtitle="Usuários que se cadastraram"
            />
            <MetricCard
              title="Taxa de Conversão"
              value={`${campaign.metrics.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              subtitle="Cadastros / Enviados"
            />
          </div>

          {/* Funil de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Enviados', value: campaign.metrics.sent, color: 'bg-blue-500' },
                  { name: 'Entregues', value: campaign.metrics.delivered, color: 'bg-green-500' },
                  { name: 'Abertos', value: campaign.metrics.opened, color: 'bg-yellow-500' },
                  { name: 'Clicados', value: campaign.metrics.clicked, color: 'bg-orange-500' },
                  { name: 'Cadastrados', value: campaign.metrics.registered, color: 'bg-purple-500' }
                ].map((stage, index) => {
                  const maxValue = campaign.metrics.sent;
                  const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                  const conversionRate = index > 0 && campaign.metrics.sent > 0
                    ? ((stage.value / campaign.metrics.sent) * 100).toFixed(1)
                    : '100.0';

                  return (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stage.name}</span>
                        <div className="text-right">
                          <span className="font-bold">{stage.value.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({conversionRate}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className={`${stage.color} h-4 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium`}
                          style={{ width: `${Math.max(width, 5)}%` }}
                        >
                          {width > 15 && stage.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.channels.includes('email') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Template de Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {campaign.emailTemplate || 'Template não disponível'}
                  </div>
                </CardContent>
              </Card>
            )}

            {campaign.channels.includes('whatsapp') && campaign.whatsappTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Template de WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {campaign.whatsappTemplate}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Follow-up Rules */}
          {campaign.followUpRules.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Regras de Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2 text-green-600">Ativo</span>
                  </div>
                  <div>
                    <span className="font-medium">Intervalos:</span>
                    <span className="ml-2">{campaign.followUpRules.intervals.join(', ')} dias</span>
                  </div>
                  <div>
                    <span className="font-medium">Máximo de tentativas:</span>
                    <span className="ml-2">{campaign.followUpRules.maxAttempts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
