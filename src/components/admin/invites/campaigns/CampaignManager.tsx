
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Play, 
  Pause, 
  Copy, 
  Trash2, 
  Edit, 
  BarChart3,
  Calendar,
  Users,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useCampaignManagement, type InviteCampaign } from '@/hooks/admin/invites/useCampaignManagement';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { CampaignDetailsDialog } from './CampaignDetailsDialog';

export const CampaignManager = () => {
  const { 
    campaigns, 
    loading, 
    updateCampaignStatus, 
    deleteCampaign, 
    duplicateCampaign 
  } = useCampaignManagement();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<InviteCampaign | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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
      year: 'numeric'
    });
  };

  const handleViewDetails = (campaign: InviteCampaign) => {
    setSelectedCampaign(campaign);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Campanhas</h2>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas de convites automatizadas
          </p>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Lista de Campanhas */}
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {campaign.name}
                    {getStatusBadge(campaign.status)}
                  </CardTitle>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">
                      {campaign.description}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-1">
                  {campaign.status === 'draft' || campaign.status === 'paused' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign.id, 'active')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : campaign.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : null}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(campaign)}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateCampaign(campaign.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Métricas Resumidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{campaign.metrics.totalInvites}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{campaign.metrics.sent}</div>
                  <div className="text-sm text-muted-foreground">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{campaign.metrics.registered}</div>
                  <div className="text-sm text-muted-foreground">Cadastros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {campaign.metrics.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Conversão</div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {campaign.targetRoleName || campaign.targetRole}
                </div>
                
                <div className="flex items-center gap-1">
                  {campaign.channels.includes('email') && <Mail className="w-4 h-4" />}
                  {campaign.channels.includes('whatsapp') && <MessageSquare className="w-4 h-4" />}
                  {campaign.channels.join(' + ')}
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Criada em {formatDate(campaign.createdAt)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Campanha</span>
                  <span>{campaign.metrics.conversionRate.toFixed(1)}% conversão</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((campaign.metrics.registered / Math.max(campaign.metrics.totalInvites, 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie sua primeira campanha de convites para começar a gerenciar seus envios de forma automatizada.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateCampaignDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      {selectedCampaign && (
        <CampaignDetailsDialog
          campaign={selectedCampaign}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </div>
  );
};
