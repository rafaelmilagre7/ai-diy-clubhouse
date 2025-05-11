
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Mail, Trash2, RefreshCw, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvites, Invite } from "@/hooks/admin/useInvites";
import { useTrustedDomains } from "@/hooks/admin/useTrustedDomains";
import { useRoles } from "@/hooks/admin/useRoles";
import { toast } from "sonner";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Componente para criar novo convite
const CreateInviteDialog = ({ roles, onInviteCreated }: { roles: any[], onInviteCreated: () => void }) => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");
  const [expiration, setExpiration] = useState("7 days");
  const [open, setOpen] = useState(false);
  const { createInvite, isCreating } = useInvites();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const result = await createInvite(email, roleId, notes, expiration);
    if (result) {
      setEmail("");
      setRoleId("");
      setNotes("");
      setExpiration("7 days");
      setOpen(false);
      onInviteCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Envie um convite para novos membros acessarem a plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Papel</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiration">Expira em</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration">
                  <SelectValue placeholder="Período de expiração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 dia</SelectItem>
                  <SelectItem value="3 days">3 dias</SelectItem>
                  <SelectItem value="7 days">7 dias</SelectItem>
                  <SelectItem value="14 days">14 dias</SelectItem>
                  <SelectItem value="30 days">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre o convite"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para criar novo domínio confiável
const CreateDomainDialog = ({ roles, onDomainCreated }: { roles: any[], onDomainCreated: () => void }) => {
  const [domain, setDomain] = useState("");
  const [roleId, setRoleId] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const { createDomain, isCreating } = useTrustedDomains();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain || !roleId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Validação simples de domínio
    if (!domain.includes('.')) {
      toast.error("Formato de domínio inválido");
      return;
    }
    
    const result = await createDomain(domain, roleId, description);
    if (result) {
      setDomain("");
      setRoleId("");
      setDescription("");
      setOpen(false);
      onDomainCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Domínio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Domínio Confiável</DialogTitle>
            <DialogDescription>
              Adicione um domínio de email que terá acesso automático com um papel específico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                type="text"
                placeholder="exemplo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain-role">Papel</Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger id="domain-role">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descrição sobre este domínio confiável"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Adicionar Domínio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente para a lista de convites
const InvitesList = ({ invites, onDelete, onResend }: { 
  invites: Invite[], 
  onDelete: (id: string) => void,
  onResend: (invite: Invite) => void
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado para área de transferência");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.length > 0 ? (
          invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {invite.role?.name || "Desconhecido"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(invite.expires_at)}</span>
                </div>
              </TableCell>
              <TableCell>
                {invite.used_at ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Utilizado
                  </Badge>
                ) : new Date(invite.expires_at) < new Date() ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Expirado
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Ativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}/convite/${invite.token}`)}
                  title="Copiar link de convite"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResend(invite)}
                    title="Reenviar convite"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(invite.id)}
                  title="Excluir convite"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              Nenhum convite encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// Componente para a lista de domínios confiáveis
const DomainsList = ({ domains, onDelete, onToggleStatus }: { 
  domains: any[], 
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: boolean) => void
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domínio</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.length > 0 ? (
          domains.map((domain) => (
            <TableRow key={domain.id}>
              <TableCell className="font-medium">{domain.domain}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {domain.role?.name || "Desconhecido"}
                </Badge>
              </TableCell>
              <TableCell>{domain.description || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={domain.is_active} 
                    onCheckedChange={() => onToggleStatus(domain.id, domain.is_active)}
                  />
                  <span>{domain.is_active ? "Ativo" : "Inativo"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(domain.id)}
                  title="Excluir domínio"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              Nenhum domínio confiável encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default function InvitesManagement() {
  // Substituindo o Helmet pelo hook useDocumentTitle
  useDocumentTitle("Gerenciamento de Convites | Admin");
  
  const [activeTab, setActiveTab] = useState("invites");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    invites, 
    loading: loadingInvites,
    fetchInvites,
    deleteInvite,
    resendInvite
  } = useInvites();
  
  const {
    domains,
    loading: loadingDomains,
    fetchDomains,
    deleteDomain,
    toggleDomainStatus
  } = useTrustedDomains();
  
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
  
  // Manipuladores de evento
  const handleDeleteInvite = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este convite?");
    if (confirmed) {
      await deleteInvite(id);
    }
  };
  
  const handleResendInvite = async (invite: Invite) => {
    await resendInvite(invite);
  };
  
  const handleDeleteDomain = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este domínio?");
    if (confirmed) {
      await deleteDomain(id);
    }
  };
  
  const handleDomainToggle = async (id: string, currentStatus: boolean) => {
    await toggleDomainStatus(id, currentStatus);
  };
  
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
              {loadingInvites ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <InvitesList 
                  invites={filteredInvites} 
                  onDelete={handleDeleteInvite}
                  onResend={handleResendInvite}
                />
              )}
            </TabsContent>
            
            <TabsContent value="domains" className="space-y-4">
              {loadingDomains ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DomainsList 
                  domains={filteredDomains}
                  onDelete={handleDeleteDomain}
                  onToggleStatus={handleDomainToggle}
                />
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
