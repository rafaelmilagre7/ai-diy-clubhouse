
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import SimpleInvitesTab from './components/SimpleInvitesTab';
import { SimplifiedCreateInviteModal } from './components/SimplifiedCreateInviteModal';
import { ForceDeleteDialog } from '@/components/admin/users/ForceDeleteDialog';
import { InviteAnalyticsDashboard } from '@/components/admin/invites/analytics/InviteAnalyticsDashboard';
import { CampaignManager } from '@/components/admin/invites/campaigns/CampaignManager';
import { OnboardingHealthDashboard } from '@/components/admin/invites/onboarding/OnboardingHealthDashboard';
import { UserHealthDashboard } from '@/components/admin/invites/health/UserHealthDashboard';
import { useInvites, type Invite } from '@/hooks/admin/useInvites';
import { type CreateInviteParams } from '@/hooks/admin/invites/types';

const InvitesManagement = () => {
  const [open, setOpen] = useState(false);
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const { invites, loading, fetchInvites, createInvite, isCreating } = useInvites();

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 InvitesManagement: Iniciando criação de convite:", params);
      
      const result = await createInvite(params);
      
      if (result?.status === 'success') {
        toast.success('Convite criado e enviado com sucesso!');
        console.log("✅ InvitesManagement: Convite criado com sucesso");
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

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Gerenciar Convites</h1>
          <p className="text-muted-foreground">
            Crie, gerencie e analise os convites para sua plataforma.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setForceDeleteOpen(true)}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            🚨 EXCLUSÃO TOTAL
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Convite
          </Button>
        </div>
      </div>

      <Tabs defaultValue="convites" className="mt-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="convites">Convites</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
        </TabsList>

        <TabsContent value="convites" className="space-y-4">
          <SimpleInvitesTab
            invites={invites}
            loading={loading}
            onInvitesChange={fetchInvites}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <InviteAnalyticsDashboard />
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
      </Tabs>

      <SimplifiedCreateInviteModal
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateInvite}
        isLoading={isCreating}
      />

      <ForceDeleteDialog
        open={forceDeleteOpen}
        onOpenChange={setForceDeleteOpen}
        onSuccess={fetchInvites}
      />
    </div>
  );
};

export default InvitesManagement;
