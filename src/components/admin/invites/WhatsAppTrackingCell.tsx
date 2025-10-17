import React from 'react';
import { 
  MessageCircle,
  MessageSquare,
  Eye, 
  XCircle, 
  Timer,
  Clock
} from "lucide-react";
import { useInviteDeliveries } from "@/hooks/admin/invites/useInviteDeliveries";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WhatsAppTrackingCellProps {
  inviteId: string;
}

export const WhatsAppTrackingCell: React.FC<WhatsAppTrackingCellProps> = ({ inviteId }) => {
  const { deliveries, loading } = useInviteDeliveries(inviteId);

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-muted-foreground">...</span>
      </div>
    );
  }

  const whatsappDeliveries = deliveries?.filter(d => d.channel === 'whatsapp') || [];

  if (whatsappDeliveries.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        -
      </div>
    );
  }

  // Pegar o delivery mais recente ou com melhor status
  const bestDelivery = whatsappDeliveries.reduce((best, current) => {
    const statusPriority = { 'read': 3, 'delivered': 2, 'sent': 1, 'failed': 0, 'undelivered': 0 };
    const currentPriority = statusPriority[current.status as keyof typeof statusPriority] || 0;
    const bestPriority = statusPriority[best.status as keyof typeof statusPriority] || 0;
    return currentPriority > bestPriority ? current : best;
  });

  const getStatusDisplay = (delivery: any) => {
    const { status, metadata } = delivery;
    const whatsappStatus = metadata?.whatsapp_status || status;
    
    switch (whatsappStatus) {
      case 'read':
        return {
          icon: <Eye className="h-3 w-3 text-tracking-opened" />,
          text: 'Lido',
          color: 'text-tracking-opened'
        };
      case 'delivered':
        return {
          icon: <MessageCircle className="h-3 w-3 text-tracking-delivered" />,
          text: 'Entregue',
          color: 'text-tracking-delivered'
        };
      case 'sent':
      case 'queued':
        return {
          icon: <MessageSquare className="h-3 w-3 text-tracking-sent" />,
          text: 'Enviado',
          color: 'text-tracking-sent'
        };
      case 'failed':
      case 'undelivered':
        return {
          icon: <XCircle className="h-3 w-3 text-tracking-failed" />,
          text: 'Falhou',
          color: 'text-tracking-failed'
        };
      case 'simulated':
        return {
          icon: <Timer className="h-3 w-3 text-tracking-bounced" />,
          text: 'Simulado',
          color: 'text-tracking-bounced'
        };
      default:
        return {
          icon: <Timer className="h-3 w-3 text-status-warning" />,
          text: 'Processando',
          color: 'text-status-warning'
        };
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

  const statusDisplay = getStatusDisplay(bestDelivery);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {statusDisplay.icon}
        <span className={`text-xs font-medium ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
      </div>
      {bestDelivery.updated_at && (
        <span className="text-xs text-muted-foreground">
          {formatTime(bestDelivery.updated_at)}
        </span>
      )}
      {bestDelivery.metadata?.simulated && (
        <span className="text-xs text-tracking-bounced">
          Config. pendente
        </span>
      )}
    </div>
  );
};