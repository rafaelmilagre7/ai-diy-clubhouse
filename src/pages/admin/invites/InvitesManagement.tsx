
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
import { UserHealthDashboard } from '@/components/admin/invites/health/UserHealthDashboard';
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
  const { invites, loading, fetchInvites, createInvite, isCreating, deleteInvite, resendInvite } = useInvites();
  const { prefetchInviteData, invalidateInviteData } = useInviteCache();

  useEffect(() => {
    fetchInvites();
    // Prefetch dados para melhor performance
    prefetchInviteData();
  }, [fetchInvites, prefetchInviteData]);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 InvitesManagement: Iniciando criação de convite:", params);
      
      const result = await createInvite(params);
      
      if (result?.status === 'success') {
        toast.success('Convite criado e enviado com sucesso!');
        console.log("✅ InvitesManagement: Convite criado com sucesso");
        setOpen(false);
        // Invalidar cache para atualizar dados
        invalidateInviteData();
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
      await deleteInvite(inviteId);
      invalidateInviteData();
    } catch (error) {
      console.error("Erro ao deletar convite:", error);
    }
  };

  const handleResendInvite = async (invite: Invite) => {
    try {
      await resendInvite(invite);
      invalidateInviteData();
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Prefetch dados específicos da aba se necessário
    if (value === 'analytics' || value === 'monitoramento') {
      prefetchInviteData();
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Gerenciar Convites</h1>
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="convites">Convites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
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

        <TabsContent value="health" className="space-y-4">
          <UserHealthDashboard />
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
