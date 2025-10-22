import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NotificationQueueItem } from '@/hooks/admin/notifications/useNotificationQueue';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationDetailsModalProps {
  notification: NotificationQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDetailsModal = ({
  notification,
  isOpen,
  onClose,
}: NotificationDetailsModalProps) => {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detalhes da Notificação</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-md">
          <div className="space-y-md">
            {/* Informações básicas */}
            <div>
              <h4 className="text-sm font-semibold mb-sm">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-sm text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-mono text-xs">{notification.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Usuário:</span>
                  <p>{notification.profiles?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="truncate">{notification.profiles?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-xs">
                    <Badge variant={notification.status === 'sent' ? 'success' : 'default'}>
                      {notification.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div>
              <h4 className="text-sm font-semibold mb-sm">Conteúdo</h4>
              <div className="space-y-sm">
                <div>
                  <span className="text-muted-foreground text-sm">Título:</span>
                  <p className="text-sm font-medium">{notification.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Mensagem:</span>
                  <p className="text-sm">{notification.message}</p>
                </div>
              </div>
            </div>

            {/* Categorização */}
            <div>
              <h4 className="text-sm font-semibold mb-sm">Categorização</h4>
              <div className="flex flex-wrap gap-sm">
                <Badge variant="outline">{notification.category}</Badge>
                <Badge variant="outline">{notification.notification_type}</Badge>
                <Badge variant="outline">{notification.priority}</Badge>
              </div>
            </div>

            {/* Canais */}
            <div>
              <h4 className="text-sm font-semibold mb-sm">Canais de Entrega</h4>
              <div className="flex flex-wrap gap-sm">
                {notification.channels.map((channel) => (
                  <Badge key={channel} variant="secondary">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div>
              <h4 className="text-sm font-semibold mb-sm">Timestamps</h4>
              <div className="grid grid-cols-2 gap-sm text-sm">
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p>{format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Agendado para:</span>
                  <p>{format(new Date(notification.scheduled_for), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                </div>
                {notification.sent_at && (
                  <div>
                    <span className="text-muted-foreground">Enviado em:</span>
                    <p>{format(new Date(notification.sent_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Lida:</span>
                  <p>{notification.is_read ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>

            {/* Tentativas */}
            {notification.retry_count > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-sm">Tentativas de Envio</h4>
                <p className="text-sm">{notification.retry_count} tentativa(s)</p>
              </div>
            )}

            {/* Erro */}
            {notification.error_message && (
              <div>
                <h4 className="text-sm font-semibold mb-sm text-status-error">Mensagem de Erro</h4>
                <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-sm">
                  <p className="text-sm text-status-error font-mono">{notification.error_message}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            {notification.metadata && Object.keys(notification.metadata).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-sm">Metadata (JSON)</h4>
                <pre className="bg-surface-elevated p-sm rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(notification.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
