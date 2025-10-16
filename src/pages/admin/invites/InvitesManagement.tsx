
import { useState, useEffect, useCallback } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import { useRoleMapping } from "@/hooks/admin/invites/useRoleMapping";
import OptimizedCreateInviteDialog from "@/components/admin/invites/OptimizedCreateInviteDialog";
import SimpleInvitesTab from "./components/SimpleInvitesTab";
import { BulkInviteUpload } from "@/components/admin/invites/BulkInviteUpload";
import { BulkInviteProgress } from "@/components/admin/invites/BulkInviteProgress";
import { useInviteBulkCreate } from "@/hooks/admin/invites/useInviteBulkCreate";
import { type CleanedContact } from "@/utils/contactDataCleaner";
import { Mail, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { InviteSystemStatusIndicator } from '@/components/admin/invites/InviteSystemStatusIndicator';

const InvitesManagement = () => {
  useDocumentTitle("Gerenciar Convites | Admin");
  
  const { roles } = usePermissions();
  const { roles: mappedRoles, loading: rolesLoading } = useRoleMapping();
  const { invites, loading: invitesLoading, fetchInvites } = useInvitesList();
  const { createBulkInvites, progress, resetProgress, isCreating } = useInviteBulkCreate();
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleInvitesChange = useCallback(() => {
    fetchInvites();
  }, [fetchInvites]);

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-8 relative overflow-hidden">
      {/* Aurora Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-aurora/10 to-aurora-primary/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-operational/8 to-revenue/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-strategy/6 to-aurora/4 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with Aurora Style */}
      <div className="relative aurora-glass rounded-2xl p-8 border border-aurora/20 backdrop-blur-md">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-16 bg-gradient-to-b from-aurora via-aurora-primary to-operational rounded-full aurora-glow"></div>
              <div>
                <h1 className="text-4xl font-bold aurora-text-gradient">
                  Gerenciar Convites
                </h1>
                <p className="text-lg text-muted-foreground mt-2 font-medium">
                  Convide novos usuários com elegância e controle total
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full aurora-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {invites.filter(inv => inv.used_at).length} Ativos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full aurora-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {invites.filter(inv => !inv.used_at && new Date(inv.expires_at) > new Date()).length} Pendentes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {invites.filter(inv => !inv.used_at && new Date(inv.expires_at) <= new Date()).length} Expirados
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <InviteSystemStatusIndicator />
            <OptimizedCreateInviteDialog roles={roles} onInviteCreated={handleInvitesChange} />
          </div>
        </div>
      </div>

      {/* Enhanced Tabs with Aurora Style */}
      <Tabs defaultValue="invites" className="w-full relative">
        <TabsList className="grid w-full grid-cols-2 aurora-glass border-aurora/20 backdrop-blur-md h-14 rounded-2xl p-1.5">
          <TabsTrigger 
            value="invites"
            className="data-[state=active]:aurora-glass data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora/20 data-[state=active]:to-aurora-primary/10 data-[state=active]:text-aurora data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-medium"
          >
            Lista de Convites
          </TabsTrigger>
          <TabsTrigger 
            value="bulk"
            className="data-[state=active]:aurora-glass data-[state=active]:bg-gradient-to-r data-[state=active]:from-operational/20 data-[state=active]:to-revenue/10 data-[state=active]:text-operational data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-medium"
          >
            Convites em Lote
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invites" className="mt-8 animate-fade-in">
          <div className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md overflow-hidden">
            <div className="bg-gradient-to-r from-aurora/10 via-aurora-primary/5 to-transparent p-8 border-b border-aurora/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-aurora/20 to-aurora-primary/10 aurora-glass">
                  <Mail className="h-6 w-6 text-aurora" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold aurora-text-gradient">Lista de Convites</h2>
                  <p className="text-muted-foreground font-medium">
                    Monitore e gerencie todos os convites da plataforma
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <SimpleInvitesTab
                invites={invites}
                loading={invitesLoading}
                onInvitesChange={handleInvitesChange}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-8 animate-fade-in">
          <div className="aurora-glass rounded-2xl border border-operational/20 backdrop-blur-md overflow-hidden">
            <div className="bg-gradient-to-r from-operational/10 via-revenue/5 to-transparent p-8 border-b border-operational/20">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-operational/20 to-revenue/10 aurora-glass">
                  <Users className="h-6 w-6 text-operational" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold aurora-text-gradient">Convites em Lote</h2>
                  <p className="text-muted-foreground font-medium">
                    Envie convites para múltiplos usuários com limpeza inteligente de dados
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <BulkInviteUpload
                roles={mappedRoles}
                rolesLoading={rolesLoading}
                onProceedWithContacts={async (contacts, roleId) => {
                  console.log(`🚀 [INVITES-MGT] Iniciando criação de ${contacts.length} convites com roleId: ${roleId}`);
                  
                  setShowProgressModal(true);
                  
                  const result = await createBulkInvites(contacts, roleId);
                  
                  if (result) {
                    // Atualizar lista de convites após o processamento
                    fetchInvites();
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Progresso */}
      <BulkInviteProgress
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          resetProgress();
        }}
        progress={progress}
        onCancel={() => {
          // TODO: Implementar cancelamento se necessário
          console.log('Cancel bulk invite requested');
        }}
      />
    </div>
  );
};

export default InvitesManagement;
