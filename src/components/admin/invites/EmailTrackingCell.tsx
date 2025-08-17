import React from 'react';
import { 
  Mail, 
  MailCheck, 
  Eye, 
  MousePointer, 
  AlertTriangle, 
  XCircle, 
  Clock
} from "lucide-react";
import { useInviteDeliveries } from "@/hooks/admin/invites/useInviteDeliveries";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmailTrackingCellProps {
  inviteId: string;
}

export const EmailTrackingCell: React.FC<EmailTrackingCellProps> = ({ inviteId }) => {
  const { deliveries, loading } = useInviteDeliveries(inviteId);

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-muted-foreground">...</span>
      </div>
    );
  }

  const emailDeliveries = deliveries?.filter(d => d.channel === 'email') || [];

  if (emailDeliveries.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        -
      </div>
    );
  }

  // Pegar o delivery mais recente ou com melhor status
  const bestDelivery = emailDeliveries.reduce((best, current) => {
    const statusPriority = { 'clicked': 4, 'opened': 3, 'delivered': 2, 'sent': 1, 'failed': 0, 'bounced': 0, 'complained': 0 };
    const currentPriority = statusPriority[current.status as keyof typeof statusPriority] || 0;
    const bestPriority = statusPriority[best.status as keyof typeof statusPriority] || 0;
    return currentPriority > bestPriority ? current : best;
  });

  const getStatusDisplay = (delivery: any) => {
    const { status, metadata } = delivery;
    
    switch (status) {
      case 'clicked':
        const clickCount = metadata?.click_count;
        return {
          icon: <MousePointer className="h-3 w-3 text-indigo-600" />,
          text: clickCount && clickCount > 1 ? `Clicado (${clickCount}x)` : 'Clicado',
          color: 'text-indigo-600'
        };
      case 'opened':
        const openCount = metadata?.open_count;
        return {
          icon: <Eye className="h-3 w-3 text-emerald-600" />,
          text: openCount && openCount > 1 ? `Aberto (${openCount}x)` : 'Aberto',
          color: 'text-emerald-600'
        };
      case 'delivered':
        return {
          icon: <MailCheck className="h-3 w-3 text-green-600" />,
          text: 'Entregue',
          color: 'text-green-600'
        };
      case 'sent':
        return {
          icon: <Mail className="h-3 w-3 text-blue-600" />,
          text: 'Enviado',
          color: 'text-blue-600'
        };
      case 'bounced':
        return {
          icon: <AlertTriangle className="h-3 w-3 text-orange-600" />,
          text: 'Rejeitado',
          color: 'text-orange-600'
        };
      case 'complained':
        return {
          icon: <XCircle className="h-3 w-3 text-red-600" />,
          text: 'Spam',
          color: 'text-red-600'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-3 w-3 text-red-600" />,
          text: 'Falhou',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="h-3 w-3 text-gray-500" />,
          text: 'Pendente',
          color: 'text-gray-500'
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
    </div>
  );
};