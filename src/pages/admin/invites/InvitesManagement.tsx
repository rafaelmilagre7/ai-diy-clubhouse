
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import SimpleInvitesTab from './components/SimpleInvitesTab';
import { SimplifiedCreateInviteModal } from './components/SimplifiedCreateInviteModal';
import { InviteAnalyticsDashboard } from '@/components/admin/invites/analytics/InviteAnalyticsDashboard';
import { CampaignManager } from '@/components/admin/invites/campaigns/CampaignManager';
import { OnboardingHealthDashboard } from '@/components/admin/invites/onboarding/OnboardingHealthDashboard';
import { AdminToolsTab } from '@/components/admin/invites/administration/AdminToolsTab';
import { InviteAuditDashboard } from '@/components/admin/invites/audit/InviteAuditDashboard';
import { RealTimeMonitoring } from '@/components/admin/invites/monitoring/RealTimeMonitoring';
import { OptimizedInviteInterface } from '@/components/admin/invites/ui/OptimizedInviteInterface';
import { useInvites, type Invite } from '@/hooks/admin/useInvites';
import { useInviteCache } from '@/hooks/admin/invites/useInviteCache';
import { type CreateInviteParams } from '@/hooks/admin/invites/types';

const InvitesManagement = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('convites');
  const { 
    invites, 
    loading, 
    fetchInvites, 
    createInvite, 
    isCreating, 
    deleteInvite, 
    resendInvite,
    realtimeConnected,
    prefetchCriticalData
  } = useInvites();

  const { invalidateInviteData } = useInviteCache();

  useEffect(() => {
    console.log('🚀 [INVITES-MANAGEMENT] Inicializando com cache otimizado');
    
    // Buscar dados iniciais
    fetchInvites();
    
    // Pré-carregar dados críticos
    prefetchCriticalData();
  }, [fetchInvites, prefetchCriticalData]);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 InvitesManagement: Criando convite com sistema otimizado:", params);
      
      const result = await createInvite(params);
      
      if (result?.status === 'success') {
        console.log("✅ InvitesManagement: Convite criado com sucesso");
        setOpen(false);
        
        // Toast com informações mais detalhadas
        const channels = params.channels?.join(' e ') || 'email';
        toast.success(`Convite enviado via ${channels}!`, {
          description: `Convite para ${params.email} criado com sucesso`
        });
      } else {
        toast.error(result?.message || 'Erro ao criar convite');
        console.error("❌ InvitesManagement: Falha na criação:", result?.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      toast.error(`Erro ao criar convite: ${errorMessage}`);
      console.error("❌ InvitesManagement: Erro ao criar convite:", error);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      console.log("🗑️ InvitesManagement: Deletando convite:", inviteId);
      await deleteInvite(inviteId);
      toast.success('Convite removido com sucesso');
    } catch (error) {
      console.error("❌ InvitesManagement: Erro ao deletar convite:", error);
      toast.error('Erro ao remover convite');
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    try {
      console.log("🔄 InvitesManagement: Reenviando convite:", invite.id);
      await resendInvite(invite);
      toast.success('Convite reenviado com sucesso');
    } catch (error) {
      console.error("❌ InvitesManagement: Erro ao reenviar convite:", error);
      toast.error('Erro ao reenviar convite');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`📋 [INVITES-MANAGEMENT] Mudando para aba: ${value}`);
    
    // Pré-carregar dados específicos da aba
    if (value === 'analytics' || value === 'monitoramento') {
      prefetchCriticalData();
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold">Gerenciar Convites</h1>
            {realtimeConnected && (
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Tempo Real</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Sistema completo de convites com analytics avançado e monitoramento em tempo real.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Convite
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="convites">Convites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          <TabsTrigger value="administracao">Administração</TabsTrigger>
        </TabsList>

        <TabsContent value="convites" className="space-y-4">
          <OptimizedInviteInterface
            invites={invites}
            loading={loading}
            onRefresh={fetchInvites}
            onCreateNew={() => setOpen(true)}
            onResend={handleResendInvite}
            onDelete={handleDeleteInvite}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <InviteAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="monitoramento" className="space-y-4">
          <RealTimeMonitoring />
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <OnboardingHealthDashboard />
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <InviteAuditDashboard />
        </TabsContent>

        <TabsContent value="administracao" className="space-y-4">
          <AdminToolsTab onRefresh={fetchInvites} />
        </TabsContent>
      </Tabs>

      <SimplifiedCreateInviteModal
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateInvite}
        isLoading={isCreating}
      />
    </div>
  );
};

export default InvitesManagement;
