import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Mail, 
  Eye, 
  MousePointer, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeliveryEvent {
  id: string;
  invite_id: string;
  channel: 'email' | 'whatsapp';
  status: string;
  provider_id?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failed_at?: string;
  metadata?: {
    open_count?: number;
    click_count?: number;
    bounce_type?: string;
    bounce_message?: string;
    whatsapp_status?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface DeliveryStatusDetailsProps {
  deliveries: DeliveryEvent[];
  inviteEmail: string;
}

export const DeliveryStatusDetails: React.FC<DeliveryStatusDetailsProps> = ({
  deliveries,
  inviteEmail
}) => {
  const getEventIcon = (status: string, channel: 'email' | 'whatsapp') => {
    if (channel === 'whatsapp') {
      switch (status) {
        case 'delivered': return <MessageCircle className="h-4 w-4 text-tracking-delivered" />;
        case 'read': return <Eye className="h-4 w-4 text-tracking-opened" />;
        case 'failed': return <XCircle className="h-4 w-4 text-tracking-failed" />;
        default: return <Clock className="h-4 w-4 text-status-neutral" />;
      }
    } else {
      switch (status) {
        case 'sent': return <Mail className="h-4 w-4 text-tracking-sent" />;
        case 'delivered': return <CheckCircle className="h-4 w-4 text-tracking-delivered" />;
        case 'opened': return <Eye className="h-4 w-4 text-tracking-opened" />;
        case 'clicked': return <MousePointer className="h-4 w-4 text-tracking-clicked" />;
        case 'bounced': return <AlertTriangle className="h-4 w-4 text-tracking-bounced" />;
        case 'complained': return <XCircle className="h-4 w-4 text-tracking-failed" />;
        default: return <Clock className="h-4 w-4 text-status-neutral" />;
      }
    }
  };

  const getStatusText = (status: string, channel: 'email' | 'whatsapp', metadata?: any) => {
    if (channel === 'whatsapp') {
      switch (status) {
        case 'sent': return 'Mensagem enviada';
        case 'delivered': return 'Mensagem entregue';
        case 'read': return 'Mensagem lida';
        case 'failed': return 'Falha no envio';
        default: return 'Status desconhecido';
      }
    } else {
      switch (status) {
        case 'sent': return 'Email enviado';
        case 'delivered': return 'Email entregue';
        case 'opened': 
          const openCount = metadata?.open_count || 1;
          return openCount > 1 ? `Email aberto ${openCount} vezes` : 'Email aberto';
        case 'clicked':
          const clickCount = metadata?.click_count || 1;
          return clickCount > 1 ? `Link clicado ${clickCount} vezes` : 'Link clicado';
        case 'bounced': return `Email rejeitado${metadata?.bounce_type ? ` (${metadata.bounce_type})` : ''}`;
        case 'complained': return 'Marcado como spam';
        default: return 'Status desconhecido';
      }
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      return format(new Date(timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  if (!deliveries || deliveries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Status de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento de entrega registrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por canal
  const emailEvents = deliveries.filter(d => d.channel === 'email');
  const whatsappEvents = deliveries.filter(d => d.channel === 'whatsapp');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Histórico de Entrega - {inviteEmail}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {emailEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-tracking-sent" />
              <h4 className="font-medium text-sm">Email</h4>
            </div>
            <div className="space-y-2">
              {emailEvents.map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                  {getEventIcon(event.status, 'email')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getStatusText(event.status, 'email', event.metadata)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(
                        event.clicked_at || 
                        event.opened_at || 
                        event.delivered_at || 
                        event.sent_at || 
                        event.created_at
                      )}
                    </p>
                    {event.metadata?.bounce_message && (
                      <p className="text-xs text-status-error mt-1">{event.metadata.bounce_message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {emailEvents.length > 0 && whatsappEvents.length > 0 && (
          <Separator />
        )}

        {whatsappEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-tracking-delivered" />
              <h4 className="font-medium text-sm">WhatsApp</h4>
            </div>
            <div className="space-y-2">
              {whatsappEvents.map((event, index) => (
                <div key={`${event.id}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                  {getEventIcon(event.status, 'whatsapp')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getStatusText(event.status, 'whatsapp', event.metadata)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(event.delivered_at || event.sent_at || event.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};