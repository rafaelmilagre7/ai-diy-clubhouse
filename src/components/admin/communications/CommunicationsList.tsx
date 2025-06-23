import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Send, 
  Eye, 
  Calendar,
  Users,
  Mail,
  MessageSquare,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommunicationsListProps {
  communications: any[];
  isLoading: boolean;
  onEdit: (communication: any) => void;
  onSend: (communicationId: string) => void;
  onDelete: (communicationId: string) => void;
}

export const CommunicationsList = ({ 
  communications, 
  isLoading, 
  onEdit, 
  onSend, 
  onDelete 
}: CommunicationsListProps) => {
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      scheduled: { label: 'Agendada', variant: 'outline' as const },
      sent: { label: 'Enviada', variant: 'default' as const },
      failed: { label: 'Falhou', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baixa', variant: 'outline' as const },
      normal: { label: 'Normal', variant: 'secondary' as const },
      high: { label: 'Alta', variant: 'default' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const }
    };
    
    const config = priorityConfig[priority] || priorityConfig.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getChannelIcons = (channels: string[]) => {
    return channels.map(channel => {
      if (channel === 'email') {
        return <Mail key={channel} className="h-4 w-4" />;
      }
      if (channel === 'notification') {
        return <MessageSquare key={channel} className="h-4 w-4" />;
      }
      return null;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (communications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma comunicação encontrada</h3>
            <p className="text-muted-foreground">
              Crie sua primeira comunicação para começar a enviar mensagens aos usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((communication) => (
        <Card key={communication.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold truncate">
                    {communication.title}
                  </h3>
                  {getStatusBadge(communication.status)}
                  {getPriorityBadge(communication.priority)}
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {communication.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{communication.target_roles?.length || 0} grupos</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {getChannelIcons(communication.delivery_channels || [])}
                    <span>{communication.delivery_channels?.length || 0} canais</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {communication.sent_at 
                        ? `Enviada ${formatDistanceToNow(new Date(communication.sent_at), { addSuffix: true, locale: ptBR })}`
                        : `Criada ${formatDistanceToNow(new Date(communication.created_at), { addSuffix: true, locale: ptBR })}`
                      }
                    </span>
                  </div>
                  
                  {communication.scheduled_for && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Agendada para {new Date(communication.scheduled_for).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(communication)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                {(communication.status === 'draft' || communication.status === 'scheduled') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSend(communication.id)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                
                {communication.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(communication.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
