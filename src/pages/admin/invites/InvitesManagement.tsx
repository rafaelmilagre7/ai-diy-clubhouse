
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useInvites } from '@/hooks/admin/useInvites';
import { useRoles } from '@/hooks/admin/useRoles';
import { CreateInviteModal } from './components/CreateInviteModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const InvitesManagement = () => {
  const { 
    invites, 
    loading, 
    isCreating, 
    isSending, 
    isDeleting,
    fetchInvites, 
    createInvite, 
    resendInvite, 
    deleteInvite 
  } = useInvites();
  
  const { roles } = useRoles();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deleteInviteId, setDeleteInviteId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const getStatusBadge = (invite: any) => {
    if (invite.used_at) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Usado</Badge>;
    }
    
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pendente</Badge>;
  };

  const getStatusIcon = (invite: any) => {
    if (invite.used_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'used') {
        matchesStatus = !!invite.used_at;
      } else if (statusFilter === 'expired') {
        matchesStatus = !invite.used_at && new Date(invite.expires_at) < new Date();
      } else if (statusFilter === 'pending') {
        matchesStatus = !invite.used_at && new Date(invite.expires_at) >= new Date();
      }
    }
    
    const matchesRole = roleFilter === 'all' || invite.role_id === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleResendInvite = async (invite: any) => {
    try {
      await resendInvite(invite);
      toast.success('Convite reenviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao reenviar convite');
    }
  };

  const handleDeleteInvite = async () => {
    if (!deleteInviteId) return;
    
    try {
      await deleteInvite(deleteInviteId);
      toast.success('Convite excluído com sucesso!');
      setDeleteInviteId(null);
    } catch (error) {
      toast.error('Erro ao excluir convite');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Convites</h1>
          <p className="text-muted-foreground">
            Convide novos membros para a plataforma
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Convite
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="used">Usados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button 
                variant="outline" 
                onClick={fetchInvites}
                className="w-full"
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle>Convites ({filteredInvites.length})</CardTitle>
          <CardDescription>
            Lista de todos os convites enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando convites...</p>
            </div>
          ) : filteredInvites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite encontrado</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Comece criando seu primeiro convite'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && roleFilter === 'all' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Convite
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvites.map(invite => {
                const role = roles.find(r => r.id === invite.role_id);
                const isExpired = !invite.used_at && new Date(invite.expires_at) < new Date();
                const canResend = !invite.used_at && !isExpired;
                
                return (
                  <div
                    key={invite.id}
                    className={cn(
                      "border rounded-lg p-4 space-y-3 transition-all",
                      invite.used_at && "bg-green-50 border-green-200",
                      isExpired && "bg-red-50 border-red-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(invite)}
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{role?.name}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>
                              Criado em {format(new Date(invite.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(invite)}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canResend && (
                              <DropdownMenuItem 
                                onClick={() => handleResendInvite(invite)}
                                disabled={isSending}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reenviar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => setDeleteInviteId(invite.id)}
                              className="text-red-600"
                              disabled={isDeleting}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {invite.notes && (
                      <div className="bg-gray-50 rounded p-3 border-l-4 border-viverblue">
                        <p className="text-sm text-gray-700">{invite.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Expira: {format(new Date(invite.expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      {invite.last_sent_at && (
                        <span>Último envio: {format(new Date(invite.last_sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      )}
                      {invite.used_at && (
                        <span>Usado: {format(new Date(invite.used_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <CreateInviteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateInvite={createInvite}
        isCreating={isCreating}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteInviteId} onOpenChange={() => setDeleteInviteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este convite? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvite} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvitesManagement;
