
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Pause, MoreHorizontal, Users, TrendingUp, Mail, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCampaignManagement, InviteCampaign } from '@/hooks/admin/invites/useCampaignManagement';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { CampaignDetailsDialog } from './CampaignDetailsDialog';
import { CampaignEmptyState } from './CampaignEmptyState';

export const CampaignManager: React.FC = () => {
  const {
    campaigns,
    stats,
    loading,
    creating,
    createCampaign,
    updateCampaignStatus,
    duplicateCampaign
  } = useCampaignManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<InviteCampaign | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleCreateCampaign = async (data: any) => {
    await createCampaign(data);
    setShowCreateDialog(false);
  };

  const handleStatusToggle = async (campaign: InviteCampaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaignStatus(campaign.id, newStatus);
  };

  const handleViewDetails = (campaign: InviteCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsDialog(true);
  };

  const handleDuplicate = async (campaign: InviteCampaign) => {
    await duplicateCampaign(campaign.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatConversionRate = (rate: number | undefined) => {
    return rate ? `${rate.toFixed(1)}%` : '0%';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Convites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvitesSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatConversionRate(stats.avgConversionRate)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campanhas de Convite</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)} disabled={creating}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <CampaignEmptyState onCreateCampaign={() => setShowCreateDialog(true)} />
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      {campaign.target_role_id && (
                        <Badge variant="outline">
                          Papel específico
                        </Badge>
                      )}
                    </div>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Total: {campaign.totalInvites || 0}</span>
                      <span>Enviados: {campaign.sentInvites || 0}</span>
                      <span>Conversões: {campaign.conversions || 0}</span>
                      <span>Taxa: {formatConversionRate(campaign.conversionRate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(campaign)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>

                    <Button
                      variant={campaign.status === 'active' ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleStatusToggle(campaign)}
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                          Duplicar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateCampaignDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateCampaign}
        isCreating={creating}
      />

      <CampaignDetailsDialog
        campaign={selectedCampaign}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </div>
  );
};
