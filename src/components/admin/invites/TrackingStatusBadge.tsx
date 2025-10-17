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
import { cn } from "@/lib/utils";

interface TrackingStatusBadgeProps {
  status: string;
  channel: 'email' | 'whatsapp' | 'both';
  metadata?: {
    opened_at?: string;
    clicked_at?: string;
    delivered_at?: string;
    sent_at?: string;
    bounced_at?: string;
    complained_at?: string;
    open_count?: number;
    click_count?: number;
    whatsapp_status?: string;
  };
  className?: string;
}

export const TrackingStatusBadge: React.FC<TrackingStatusBadgeProps> = ({
  status,
  channel,
  metadata = {},
  className
}) => {
  const getStatusConfig = () => {
    // Status específicos para email
    if (channel === 'email' || channel === 'both') {
      switch (status) {
        case 'pending':
          return {
            icon: Clock,
            text: 'Aguardando',
            variant: 'secondary' as const,
            className: 'bg-status-neutral-lighter text-status-neutral border-status-neutral/20'
          };
        case 'sent':
          return {
            icon: Mail,
            text: 'Enviado',
            variant: 'outline' as const,
            className: 'bg-tracking-sent/10 text-tracking-sent border-tracking-sent/20'
          };
        case 'delivered':
          return {
            icon: MailCheck,
            text: 'Entregue',
            variant: 'outline' as const,
            className: 'bg-tracking-delivered/10 text-tracking-delivered border-tracking-delivered/20'
          };
        case 'opened':
          return {
            icon: Eye,
            text: metadata.open_count && metadata.open_count > 1 
              ? `Aberto (${metadata.open_count}x)` 
              : 'Aberto',
            variant: 'outline' as const,
            className: 'bg-tracking-opened/10 text-tracking-opened border-tracking-opened/20'
          };
        case 'clicked':
          return {
            icon: MousePointer,
            text: metadata.click_count && metadata.click_count > 1 
              ? `Clicado (${metadata.click_count}x)` 
              : 'Clicado',
            variant: 'default' as const,
            className: 'bg-tracking-clicked/10 text-tracking-clicked border-tracking-clicked/20'
          };
        case 'bounced':
          return {
            icon: AlertTriangle,
            text: 'Rejeitado',
            variant: 'destructive' as const,
            className: 'bg-tracking-bounced/10 text-tracking-bounced border-tracking-bounced/20'
          };
        case 'complained':
          return {
            icon: XCircle,
            text: 'Spam',
            variant: 'destructive' as const,
            className: 'bg-status-error-lighter text-status-error border-status-error/20'
          };
        case 'failed':
          return {
            icon: XCircle,
            text: 'Falhou',
            variant: 'destructive' as const,
            className: 'bg-tracking-failed/10 text-tracking-failed border-tracking-failed/20'
          };
      }
    }

    // Status específicos para WhatsApp
    if (channel === 'whatsapp') {
      const whatsappStatus = metadata.whatsapp_status;
      switch (whatsappStatus || status) {
        case 'sent':
        case 'queued':
          return {
            icon: MessageSquare,
            text: 'Enviado',
            variant: 'outline' as const,
            className: 'bg-tracking-sent/10 text-tracking-sent border-tracking-sent/20'
          };
        case 'delivered':
          return {
            icon: MessageCircle,
            text: 'Entregue',
            variant: 'outline' as const,
            className: 'bg-tracking-delivered/10 text-tracking-delivered border-tracking-delivered/20'
          };
        case 'read':
          return {
            icon: Eye,
            text: 'Lido',
            variant: 'default' as const,
            className: 'bg-tracking-opened/10 text-tracking-opened border-tracking-opened/20'
          };
        case 'failed':
        case 'undelivered':
          return {
            icon: XCircle,
            text: 'Falhou',
            variant: 'destructive' as const,
            className: 'bg-tracking-failed/10 text-tracking-failed border-tracking-failed/20'
          };
        case 'pending':
        default:
          return {
            icon: Timer,
            text: 'Processando',
            variant: 'secondary' as const,
            className: 'bg-status-warning-lighter text-status-warning border-status-warning/20'
          };
      }
    }

    // Status para canal "both" - mostrar o melhor status
    if (channel === 'both') {
      // Priorizar cliques > abertura > entrega > envio
      if (metadata.clicked_at) {
        return {
          icon: MousePointer,
          text: 'Interagiu',
          variant: 'default' as const,
          className: 'bg-tracking-clicked/10 text-tracking-clicked border-tracking-clicked/20'
        };
      }
      if (metadata.opened_at) {
        return {
          icon: Eye,
          text: 'Visualizado',
          variant: 'outline' as const,
          className: 'bg-tracking-opened/10 text-tracking-opened border-tracking-opened/20'
        };
      }
      if (metadata.delivered_at) {
        return {
          icon: CheckCircle,
          text: 'Entregue',
          variant: 'outline' as const,
          className: 'bg-tracking-delivered/10 text-tracking-delivered border-tracking-delivered/20'
        };
      }
      if (metadata.sent_at) {
        return {
          icon: Send,
          text: 'Enviado',
          variant: 'outline' as const,
          className: 'bg-tracking-sent/10 text-tracking-sent border-tracking-sent/20'
        };
      }
    }

    // Fallback
    return {
      icon: Clock,
      text: 'Aguardando',
      variant: 'secondary' as const,
      className: 'bg-status-neutral-lighter text-status-neutral border-status-neutral/20'
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <IconComponent className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};