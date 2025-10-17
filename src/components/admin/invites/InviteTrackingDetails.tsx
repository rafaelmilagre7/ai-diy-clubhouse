import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MailCheck, 
  Eye, 
  MousePointer, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  CheckCircle,
  MessageCircle,
  MessageSquare,
  Send,
  Timer
} from "lucide-react";
import { useInviteDeliveries } from "@/hooks/admin/invites/useInviteDeliveries";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InviteTrackingDetailsProps {
  inviteId: string;
}

export const InviteTrackingDetails: React.FC<InviteTrackingDetailsProps> = ({ inviteId }) => {
  const { deliveries, loading } = useInviteDeliveries(inviteId);

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Timer className="h-3 w-3 animate-spin" />
        <span className="text-xs text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        Sem tracking
      </div>
    );
  }

  const emailDeliveries = deliveries.filter(d => d.channel === 'email');
  const whatsappDeliveries = deliveries.filter(d => d.channel === 'whatsapp');

  const getStatusIcon = (status: string, channel: 'email' | 'whatsapp') => {
    if (channel === 'email') {
      switch (status) {
        case 'sent': return <Mail className="h-3 w-3 text-tracking-sent" />;
        case 'delivered': return <MailCheck className="h-3 w-3 text-tracking-delivered" />;
        case 'opened': return <Eye className="h-3 w-3 text-tracking-opened" />;
        case 'clicked': return <MousePointer className="h-3 w-3 text-tracking-clicked" />;
        case 'bounced': return <AlertTriangle className="h-3 w-3 text-tracking-bounced" />;
        case 'complained': return <XCircle className="h-3 w-3 text-tracking-failed" />;
        case 'failed': return <XCircle className="h-3 w-3 text-tracking-failed" />;
        default: return <Clock className="h-3 w-3 text-muted-foreground" />;
      }
    } else {
      switch (status) {
        case 'sent': return <MessageSquare className="h-3 w-3 text-tracking-sent" />;
        case 'delivered': return <MessageCircle className="h-3 w-3 text-tracking-delivered" />;
        case 'read': return <Eye className="h-3 w-3 text-tracking-opened" />;
        case 'failed': return <XCircle className="h-3 w-3 text-tracking-failed" />;
        default: return <Timer className="h-3 w-3 text-status-warning" />;
      }
    }
  };

  const getStatusText = (status: string, channel: 'email' | 'whatsapp', metadata: any) => {
    if (channel === 'email') {
      switch (status) {
        case 'opened':
          const openCount = metadata?.open_count;
          return openCount && openCount > 1 ? `Aberto (${openCount}x)` : 'Aberto';
        case 'clicked':
          const clickCount = metadata?.click_count;
          return clickCount && clickCount > 1 ? `Clicado (${clickCount}x)` : 'Clicado';
        case 'sent': return 'Enviado';
        case 'delivered': return 'Entregue';
        case 'bounced': return 'Rejeitado';
        case 'complained': return 'Spam';
        case 'failed': return 'Falhou';
        default: return 'Pendente';
      }
    } else {
      const whatsappStatus = metadata?.whatsapp_status || status;
      switch (whatsappStatus) {
        case 'sent': 
        case 'queued': return 'Enviado';
        case 'delivered': return 'Entregue';
        case 'read': return 'Lido';
        case 'failed':
        case 'undelivered': return 'Falhou';
        case 'simulated': return 'Simulado';
        default: return 'Processando';
      }
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Email tracking */}
      {emailDeliveries.length > 0 && (
        <div className="space-y-1">
          {emailDeliveries.map((delivery, index) => (
            <div key={`email-${index}`} className="flex items-center gap-2">
              {getStatusIcon(delivery.status, 'email')}
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {getStatusText(delivery.status, 'email', delivery.metadata)}
                </span>
                {delivery.updated_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(delivery.updated_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp tracking */}
      {whatsappDeliveries.length > 0 && (
        <div className="space-y-1">
          {whatsappDeliveries.map((delivery, index) => (
            <div key={`whatsapp-${index}`} className="flex items-center gap-2">
              {getStatusIcon(delivery.status, 'whatsapp')}
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {getStatusText(delivery.status, 'whatsapp', delivery.metadata)}
                </span>
                {delivery.updated_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(delivery.updated_at)}
                  </span>
                )}
                {delivery.metadata?.simulated && (
                  <span className="text-xs text-status-warning">
                    (Configuração pendente)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Se não há deliveries mas deveria ter */}
      {emailDeliveries.length === 0 && whatsappDeliveries.length === 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Aguardando envio
        </div>
      )}
    </div>
  );
};