
import React, { useState } from 'react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Send, Edit, Trash2, Eye, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useCommunications, AdminCommunication } from '@/hooks/admin/useCommunications';
import { CommunicationEditor } from '@/components/admin/communications/CommunicationEditor';
import { CommunicationStats } from '@/components/admin/communications/CommunicationStats';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora-primary/5 p-6 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative space-y-8">
        {/* Modern Header with Aurora Style */}
        <div className="aurora-glass rounded-2xl p-8 border border-aurora-primary/20 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-16 bg-gradient-to-b from-aurora-primary via-operational to-strategy rounded-full aurora-glow"></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-primary/20 to-operational/10 aurora-glass">
                      <Send className="h-6 w-6 text-aurora-primary" />
                    </div>
                    <h1 className="text-4xl font-bold aurora-text-gradient">
                      Comunicações Administrativas
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium">
                    Gerencie e envie comunicados para usuários da plataforma
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AdminButton 
                size="lg"
                onClick={handleNewCommunication}
                icon={<Plus />}
              >
                Novo Comunicado
              </AdminButton>
            </div>
          </div>
        </div>

        {/* Search */}
        <AdminCard variant="elevated" className="animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comunicados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 aurora-focus"
            />
          </div>
        </AdminCard>

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
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowStats(communication.id)}
                      icon={<Eye className="w-4 h-4" />}
                    />
                  )}
                  {communication.status !== 'sent' && (
                    <>
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(communication)}
                        icon={<Edit className="w-4 h-4" />}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <AdminButton 
                            variant="ghost" 
                            size="sm"
                            icon={<Send className="w-4 h-4" />}
                          />
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
                      <AdminButton 
                        variant="ghost" 
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                      />
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
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum comunicado encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

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
