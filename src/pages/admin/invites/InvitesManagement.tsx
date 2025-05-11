
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import { useTrustedDomainsList } from "@/hooks/admin/domains/useTrustedDomainsList";
import { useRoles } from "@/hooks/admin/useRoles";

import CreateInviteDialog from "./components/CreateInviteDialog";
import CreateDomainDialog from "./components/CreateDomainDialog";
import InvitesTab from "./components/InvitesTab";
import DomainsTab from "./components/DomainsTab";

const InvitesManagement = () => {
  useDocumentTitle("Gerenciamento de Convites | Admin");
  
  const [activeTab, setActiveTab] = useState("invites");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    invites, 
    loading: loadingInvites,
    fetchInvites
  } = useInvitesList();
  
  const {
    domains,
    loading: loadingDomains,
    fetchDomains
  } = useTrustedDomainsList();
  
  const {
    roles,
    fetchRoles
  } = useRoles();
  
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  
  useEffect(() => {
    if (activeTab === "invites") {
      fetchInvites();
    } else if (activeTab === "domains") {
      fetchDomains();
    }
  }, [activeTab, fetchInvites, fetchDomains]);
  
  // Filtrar convites com base na busca
  const filteredInvites = invites.filter(invite => 
    invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invite.role?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filtrar domínios com base na busca
  const filteredDomains = domains.filter(domain => 
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (domain.role?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (domain.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const refreshData = () => {
    if (activeTab === "invites") {
      fetchInvites();
    } else if (activeTab === "domains") {
      fetchDomains();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Acesso</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie convites e domínios confiáveis para acesso à plataforma
        </p>
      </div>
      
      <Tabs defaultValue="invites" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="invites">Convites</TabsTrigger>
            <TabsTrigger value="domains">Domínios Confiáveis</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={refreshData} title="Atualizar dados">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <PermissionGuard permission="users.invite">
              {activeTab === "invites" ? (
                <CreateInviteDialog roles={roles} onInviteCreated={fetchInvites} />
              ) : (
                <CreateDomainDialog roles={roles} onDomainCreated={fetchDomains} />
              )}
            </PermissionGuard>
          </div>
        </div>
        
        <div className="mt-4">
          <Input
            type="search"
            placeholder={activeTab === "invites" ? "Buscar convites..." : "Buscar domínios..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              {activeTab === "invites" ? "Convites" : "Domínios Confiáveis"}
            </CardTitle>
            <CardDescription>
              {activeTab === "invites" 
                ? "Lista de convites enviados para novos membros"
                : "Lista de domínios que têm acesso automático à plataforma"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="invites" className="space-y-4">
              <InvitesTab 
                invites={filteredInvites} 
                loading={loadingInvites} 
                onInvitesChange={fetchInvites}
              />
            </TabsContent>
            
            <TabsContent value="domains" className="space-y-4">
              <DomainsTab 
                domains={filteredDomains}
                loading={loadingDomains}
                onDomainsChange={fetchDomains}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default InvitesManagement;
