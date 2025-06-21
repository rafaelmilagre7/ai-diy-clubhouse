
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Send, Trash2, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useInvites } from '@/hooks/admin/useInvites';
import { useToast } from '@/hooks/use-toast';
import { CreateInviteModal } from './components/CreateInviteModal';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import EmailLogoUploader from './components/EmailLogoUploader';

const InvitesManagement = () => {
  const { invites, loading, createInvite, deleteInvite, resendInvite, isCreating, isDeleting, isSending } = useInvites();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateInvite = async (params: CreateInviteParams) => {
    try {
      console.log("🎯 Criando convite com parâmetros:", params);
      
      await createInvite(
        params.email,
        params.roleId,
        params.notes,
        {
          expiresIn: params.expiresIn
        }
      );
      
      setIsCreateModalOpen(false);
      toast({
        title: "Convite criado!",
        description: `Convite enviado para ${params.email}`,
      });
    } catch (error: any) {
      console.error("❌ Erro ao criar convite:", error);
      toast({
        title: "Erro ao criar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      toast({
        title: "Convite excluído",
        description: "O convite foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (invite: any) => {
    try {
      await resendInvite(invite);
      toast({
        title: "Convite reenviado",
        description: `Convite reenviado para ${invite.email}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (invite: any) => {
    if (invite.used_at) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aceito
      </Badge>;
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Expirado
      </Badge>;
    }
    
    return <Badge variant="secondary">
      <Clock className="w-3 h-3 mr-1" />
      Pendente
    </Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingInvites = invites.filter(invite => !invite.used_at && new Date(invite.expires_at) >= new Date());
  const usedInvites = invites.filter(invite => invite.used_at);
  const expiredInvites = invites.filter(invite => !invite.used_at && new Date(invite.expires_at) < new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando convites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Convites</h1>
          <p className="text-gray-600 mt-2">
            Convide novos usuários para a plataforma e gerencie convites existentes
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-viverblue hover:bg-viverblue/90"
          disabled={isCreating}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isCreating ? 'Criando...' : 'Novo Convite'}
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Convites</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900">{invites.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-600">{pendingInvites.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Aceitos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{usedInvites.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Expirados</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">{expiredInvites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Logo Uploader */}
      <div className="mb-8">
        <EmailLogoUploader />
      </div>

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Convites Enviados
          </CardTitle>
          <CardDescription>
            Lista de todos os convites enviados e seus status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite encontrado</h3>
              <p className="text-gray-600 mb-4">Comece criando seu primeiro convite</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-viverblue hover:bg-viverblue/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Convite
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Função</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Criado em</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Expira em</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Último Envio</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Tentativas</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{invite.email}</div>
                        {invite.notes && (
                          <div className="text-xs text-gray-500 mt-1">{invite.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {invite.role?.name || 'Função não encontrada'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(invite)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(invite.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(invite.expires_at)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {invite.last_sent_at ? formatDate(invite.last_sent_at) : 'Nunca enviado'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {invite.send_attempts || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvite(invite)}
                              disabled={isSending}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Reenviar
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite.id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <CreateInviteModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateInvite}
        isLoading={isCreating}
      />
    </div>
  );
};

export default InvitesManagement;
