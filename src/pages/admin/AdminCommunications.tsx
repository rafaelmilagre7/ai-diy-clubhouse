
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Send, Edit, Trash2, Eye, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useCommunications, AdminCommunication } from '@/hooks/admin/useCommunications';
import { CommunicationEditor } from '@/components/admin/communications/CommunicationEditor';
import { CommunicationStats } from '@/components/admin/communications/CommunicationStats';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminCommunications = () => {
  const { communications, isLoading, deleteCommunication, sendCommunication } = useCommunications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState<AdminCommunication | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showStats, setShowStats] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'default';
      case 'sent': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'normal': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredCommunications = communications?.filter(comm =>
    comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (communication: AdminCommunication) => {
    setSelectedCommunication(communication);
    setShowEditor(true);
  };

  const handleNewCommunication = () => {
    setSelectedCommunication(null);
    setShowEditor(true);
  };

  const handleSend = async (id: string) => {
    await sendCommunication.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    await deleteCommunication.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comunicações Administrativas</h1>
          <p className="text-muted-foreground">
            Gerencie e envie comunicados para usuários da plataforma
          </p>
        </div>
        <Button onClick={handleNewCommunication} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Comunicado
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comunicados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <div className="grid gap-4">
        {filteredCommunications.map((communication) => (
          <Card key={communication.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{communication.title}</CardTitle>
                    <Badge variant={getStatusColor(communication.status)} className="flex items-center gap-1">
                      {getStatusIcon(communication.status)}
                      {communication.status === 'draft' ? 'Rascunho' :
                       communication.status === 'scheduled' ? 'Agendado' :
                       communication.status === 'sent' ? 'Enviado' : 'Cancelado'}
                    </Badge>
                    <Badge variant={getPriorityColor(communication.priority)}>
                      {communication.priority === 'urgent' ? 'Urgente' :
                       communication.priority === 'high' ? 'Alta' :
                       communication.priority === 'normal' ? 'Normal' : 'Baixa'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Criado em {format(new Date(communication.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    {communication.sent_at && (
                      <span>Enviado em {format(new Date(communication.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{communication.target_roles.join(', ')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {communication.status === 'sent' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStats(communication.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {communication.status !== 'sent' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(communication)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Envio</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja enviar este comunicado? Após o envio não será possível editá-lo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSend(communication.id)}>
                              Enviar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(communication.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {communication.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {communication.template_type === 'announcement' ? 'Anúncio' :
                   communication.template_type === 'maintenance' ? 'Manutenção' :
                   communication.template_type === 'event' ? 'Evento' :
                   communication.template_type === 'educational' ? 'Educacional' : 'Urgente'}
                </Badge>
                {communication.delivery_channels.map(channel => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel === 'notification' ? 'Notificação' :
                     channel === 'email' ? 'E-mail' : 'WhatsApp'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum comunicado encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <CommunicationEditor
          communication={selectedCommunication}
          onClose={() => {
            setShowEditor(false);
            setSelectedCommunication(null);
          }}
        />
      )}

      {/* Stats Modal */}
      {showStats && (
        <CommunicationStats
          communicationId={showStats}
          onClose={() => setShowStats(null)}
        />
      )}
    </div>
  );
};

export default AdminCommunications;
