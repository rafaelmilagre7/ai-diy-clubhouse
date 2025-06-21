import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import SimpleInvitesTab from './components/SimpleInvitesTab';
import { CreateInviteModal } from './components/CreateInviteModal';
import { useInvites, type Invite } from '@/hooks/admin/useInvites';
import { type CreateInviteParams } from '@/hooks/admin/invites/types';

const InvitesManagement = () => {
  const [open, setOpen] = useState(false);
  const { invites, loading, fetchInvites, createInvite, isCreating } = useInvites();

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      await createInvite(params);
      toast.success('Convite criado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao criar convite: ${error.message || 'Erro desconhecido'}`);
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Gerenciar Convites</h1>
          <p className="text-muted-foreground">
            Crie, edite e gerencie os convites para sua plataforma.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Convite
        </Button>
      </div>

      <Tabs defaultValue="simples" className="mt-4">
        <TabsList>
          <TabsTrigger value="simples">Convites</TabsTrigger>
          {/* <TabsTrigger value="avancado">Relatórios</TabsTrigger> */}
        </TabsList>
        <TabsContent value="simples" className="space-y-4">
           <SimpleInvitesTab
              invites={invites}
              loading={loading}
              onInvitesChange={fetchInvites}
            />
        </TabsContent>
        {/* <TabsContent value="avancado">
          Em breve: Relatórios detalhados sobre os convites.
        </TabsContent> */}
      </Tabs>

      <CreateInviteModal
        open={open}
        onOpenChange={setOpen}
        onCreate={handleCreateInvite}
        isLoading={isCreating}
      />
    </div>
  );
};

export default InvitesManagement;
