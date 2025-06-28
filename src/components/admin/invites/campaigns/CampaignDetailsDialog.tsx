
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Mail, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { InviteCampaign } from '@/hooks/admin/invites/useCampaignManagement';

interface CampaignDetailsDialogProps {
  campaign: InviteCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignDetailsDialog: React.FC<CampaignDetailsDialogProps> = ({
  campaign,
  open,
  onOpenChange
}) => {
  if (!campaign) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign.name}
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Informações da Campanha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Criada em:</span>
                  <p className="text-sm text-muted-foreground">{formatDate(campaign.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Atualizada em:</span>
                  <p className="text-sm text-muted-foreground">{formatDate(campaign.updated_at)}</p>
                </div>
                {campaign.description && (
                  <div>
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Métricas Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Convites:</span>
                  <span className="font-medium">{campaign.totalInvites || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Enviados:</span>
                  <span className="font-medium">{campaign.sentInvites || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversões:</span>
                  <span className="font-medium">{campaign.conversions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Conversão:</span>
                  <span className="font-medium">{(campaign.conversionRate || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{campaign.sent || 0}</div>
                  <div className="text-xs text-muted-foreground">Enviados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.delivered || 0}</div>
                  <div className="text-xs text-muted-foreground">Entregues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.opened || 0}</div>
                  <div className="text-xs text-muted-foreground">Abertos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.clicked || 0}</div>
                  <div className="text-xs text-muted-foreground">Clicados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.registered || 0}</div>
                  <div className="text-xs text-muted-foreground">Registrados</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de Entrega</span>
                  <span>{campaign.sent ? ((campaign.delivered || 0) / campaign.sent * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de Abertura</span>
                  <span>{campaign.sent ? ((campaign.opened || 0) / campaign.sent * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Template de Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded text-sm">
                  {campaign.email_template || 'Template não definido'}
                </div>
              </CardContent>
            </Card>

            {campaign.channels.includes('whatsapp') && campaign.whatsapp_template && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Template de WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded text-sm">
                    {campaign.whatsapp_template}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Follow-up Rules */}
          {campaign.follow_up_rules && typeof campaign.follow_up_rules === 'object' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Regras de Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Follow-up Habilitado:</span>
                    <span className="text-sm">{campaign.follow_up_rules.enabled ? 'Sim' : 'Não'}</span>
                  </div>
                  {campaign.follow_up_rules.enabled && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Máximo de Tentativas:</span>
                        <span className="text-sm">{campaign.follow_up_rules.maxAttempts || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Intervalos:</span>
                        <span className="text-sm">{campaign.follow_up_rules.intervals?.join(', ') || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Channels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Canais de Envio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {campaign.channels.map((channel) => (
                  <Badge key={channel} variant="secondary">
                    {channel === 'email' ? 'Email' : 'WhatsApp'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
