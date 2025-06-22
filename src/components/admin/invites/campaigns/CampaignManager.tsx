
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Pause, Copy, Trash2, Users, Send, Target, TrendingUp } from 'lucide-react';
import { useCampaignManagement } from '@/hooks/admin/invites/useCampaignManagement';
import { CampaignEmptyState } from './CampaignEmptyState';

export const CampaignManager = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    campaigns,
    loading,
    updateCampaignStatus,
    deleteCampaign,
    duplicateCampaign
  } = useCampaignManagement();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'completed': return 'Concluída';
      default: return 'Rascunho';
    }
  };

  // Calcular estatísticas reais apenas com dados disponíveis
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalInvitesSent: campaigns.reduce((sum, c) => sum + c.metrics.totalInvites, 0),
    avgConversionRate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / campaigns.length 
      : 0
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campanhas de Convites</h2>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de convites organizadas
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Estatísticas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Campanhas</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
              <Target className="h-8 w-8 text-viverblue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Convites Enviados</p>
                <p className="text-2xl font-bold">{stats.totalInvitesSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão Média</p>
                <p className="text-2xl font-bold">
                  {stats.avgConversionRate > 0 ? `${stats.avgConversionRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas ou Empty State */}
      {campaigns.length === 0 ? (
        <CampaignEmptyState onCreateCampaign={() => setShowCreateForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {getStatusText(campaign.status)}
                  </Badge>
                </div>
                {campaign.description && (
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Papel: {campaign.targetRoleName || campaign.targetRole}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Convites</p>
                      <p className="font-semibold">{campaign.metrics.totalInvites}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversões</p>
                      <p className="font-semibold">{campaign.metrics.registered}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Taxa de Conversão</p>
                      <p className="font-semibold">{campaign.metrics.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {campaign.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCampaignStatus(campaign.id, 'active')}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Ativar
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateCampaign(campaign.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
