import { AdminTable } from '../ui/AdminTable';
import { NotificationQueueItem } from '@/hooks/admin/notifications/useNotificationQueue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotificationQueueTableProps {
  notifications: NotificationQueueItem[];
  isLoading: boolean;
  onViewDetails: (notification: NotificationQueueItem) => void;
  onResend: (notificationId: string) => void;
  onCancel: (notificationId: string) => void;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    sent: { variant: 'success', label: 'Enviada' },
    pending: { variant: 'warning', label: 'Pendente' },
    failed: { variant: 'destructive', label: 'Falhou' },
    cancelled: { variant: 'secondary', label: 'Cancelada' },
  };

  const config = variants[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { variant: any; label: string }> = {
    urgent: { variant: 'destructive', label: 'Urgente' },
    high: { variant: 'warning', label: 'Alta' },
    normal: { variant: 'default', label: 'Normal' },
    low: { variant: 'secondary', label: 'Baixa' },
  };

  const config = variants[priority] || { variant: 'default', label: priority };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

export const NotificationQueueTable = ({
  notifications,
  isLoading,
  onViewDetails,
  onResend,
  onCancel,
}: NotificationQueueTableProps) => {
  const columns = [
    {
      key: 'profiles',
      label: 'Usuário',
      render: (item: NotificationQueueItem) => (
        <div className="flex items-center gap-sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.profiles?.avatar_url || ''} />
            <AvatarFallback>
              {item.profiles?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{item.profiles?.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{item.profiles?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Notificação',
      render: (item: NotificationQueueItem) => (
        <div className="min-w-0 max-w-xs">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.message}</p>
          <div className="flex gap-xs mt-xs">
            <Badge variant="outline" className="text-xs">{item.category}</Badge>
            <Badge variant="outline" className="text-xs">{item.notification_type}</Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: NotificationQueueItem) => getStatusBadge(item.status),
    },
    {
      key: 'priority',
      label: 'Prioridade',
      render: (item: NotificationQueueItem) => getPriorityBadge(item.priority),
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (item: NotificationQueueItem) => (
        <div className="text-sm">
          <p>{format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.created_at), 'HH:mm:ss', { locale: ptBR })}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (item: NotificationQueueItem) => (
        <div className="flex gap-xs">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(item)}
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(item.status === 'failed' || item.status === 'pending') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onResend(item.id)}
              title="Reenviar"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {item.status === 'pending' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(item.id)}
              title="Cancelar"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      data={notifications}
      columns={columns}
      loading={isLoading}
      variant="default"
    />
  );
};
