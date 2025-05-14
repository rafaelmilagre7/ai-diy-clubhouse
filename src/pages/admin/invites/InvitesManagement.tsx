
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Copy, Mail, Check, Trash, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

// Tipos
interface Invite {
  id: string;
  email: string;
  role_id: string;
  token: string;
  used_at: string | null;
  expires_at: string;
  created_at: string;
  created_by: string;
  last_sent_at: string | null;
  send_attempts: number;
  notes: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

// Componente principal
const InvitesManagement = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<Record<string, boolean>>({});
  
  // Estado do formulário
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  
  // Estado para confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<string | null>(null);

  // Busca inicial de dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar convites
        const { data: invitesData, error: invitesError } = await supabase
          .from('invites')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (invitesError) throw invitesError;

        // Buscar perfis de usuário
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('id, name, description');
          
        if (rolesError) throw rolesError;
        
        setInvites(invitesData || []);
        setRoles(rolesData || []);
        
        // Definir perfil padrão se houver
        if (rolesData && rolesData.length > 0) {
          const memberRole = rolesData.find(r => r.name.toLowerCase() === 'member');
          setSelectedRoleId(memberRole?.id || rolesData[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar convites. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Função para copiar o token para a área de transferência
  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copiado para a área de transferência!');
  };
  
  // Função para criar novo convite
  const createInvite = async () => {
    if (!newInviteEmail.trim()) {
      toast.error('Por favor, informe um email válido');
      return;
    }
    
    if (!selectedRoleId) {
      toast.error('Por favor, selecione um perfil para o convite');
      return;
    }
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc(
        'create_invite',
        {
          p_email: newInviteEmail.trim(),
          p_role_id: selectedRoleId,
          p_notes: inviteNotes || null
        }
      );
      
      if (error) throw error;
      
      // Verificar se a criação foi bem-sucedida
      if (data && data.status === 'success') {
        toast.success('Convite criado com sucesso!');
        
        // Recarregar convites para mostrar o novo
        const { data: freshInvites, error: refreshError } = await supabase
          .from('invites')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (refreshError) throw refreshError;
        
        setInvites(freshInvites || []);
        setShowCreateDialog(false);
        resetForm();
      } else {
        toast.error(data?.message || 'Erro ao criar convite');
      }
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast.error(`Erro ao criar convite: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Função para enviar email de convite
  const sendInviteEmail = async (inviteId: string) => {
    setIsSendingEmail(prev => ({ ...prev, [inviteId]: true }));
    try {
      // Simular envio de email (substituir pela implementação real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar contador de tentativas de envio
      const { error } = await supabase.rpc(
        'update_invite_send_attempt',
        { invite_id: inviteId }
      );
      
      if (error) throw error;
      
      // Recarregar convites para atualizar o contador
      const { data: freshInvites, error: refreshError } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (refreshError) throw refreshError;
      
      setInvites(freshInvites || []);
      toast.success('Convite enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    } finally {
      setIsSendingEmail(prev => ({ ...prev, [inviteId]: false }));
    }
  };

  // Função para excluir convite
  const deleteInvite = async () => {
    if (!inviteToDelete) return;
    
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteToDelete);
        
      if (error) throw error;
      
      // Atualizar lista local
      setInvites(invites.filter(i => i.id !== inviteToDelete));
      toast.success('Convite excluído com sucesso');
    } catch (error: any) {
      console.error('Erro ao excluir convite:', error);
      toast.error(`Erro ao excluir convite: ${error.message}`);
    } finally {
      setDeleteConfirmOpen(false);
      setInviteToDelete(null);
    }
  };
  
  // Resetar formulário
  const resetForm = () => {
    setNewInviteEmail('');
    setInviteNotes('');
    // Não resetar o perfil selecionado para facilitar criação em massa
  };

  // Formatar data relativa
  const formatRelativeDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  // Verificar se um convite está expirado
  const isInviteExpired = (expiresAt: string) => {
    try {
      return !isAfter(new Date(expiresAt), new Date());
    } catch (e) {
      return true;
    }
  };
  
  // Obter nome do perfil por ID
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Gerenciamento de Convites</h1>
          <p className="text-muted-foreground">
            Crie e gerencie convites para novos usuários do VIVER DE IA Club.
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Convite
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Convites</CardTitle>
          <CardDescription>Lista de todos os convites gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse">Carregando convites...</div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum convite encontrado. Crie um novo convite usando o botão acima.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">
                        {invite.email || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <span className="text-sm font-mono truncate">
                            {invite.token}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => copyToken(invite.token)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Copiar token
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleName(invite.role_id)}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {formatRelativeDate(invite.expires_at)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {format(new Date(invite.expires_at), "dd/MM/yyyy HH:mm")}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        {invite.used_at ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="h-3.5 w-3.5 mr-1" /> 
                            Utilizado
                          </Badge>
                        ) : isInviteExpired(invite.expires_at) ? (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-400/20">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            Expirado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={invite.used_at !== null || isInviteExpired(invite.expires_at) || isSendingEmail[invite.id]}
                                  onClick={() => sendInviteEmail(invite.id)}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {invite.used_at ? 'Convite já utilizado' : 
                                 isInviteExpired(invite.expires_at) ? 'Convite expirado' : 
                                 'Reenviar email'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setInviteToDelete(invite.id);
                                    setDeleteConfirmOpen(true);
                                  }}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Excluir convite
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criação de convite */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Crie um novo convite para um usuário acessar a plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={newInviteEmail}
                onChange={(e) => setNewInviteEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Perfil
              </label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}{role.description ? ` - ${role.description}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Observações (opcional)
              </label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre este convite..."
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createInvite} 
              disabled={isCreating || !newInviteEmail.trim() || !selectedRoleId}
            >
              {isCreating ? 'Criando...' : 'Criar Convite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteInvite}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvitesManagement;
