import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, MailOpen, MousePointerClick, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeliveryStatusBadgeProps {
  status: 'clicked' | 'opened' | 'delivered' | 'sent' | 'failed' | 'bounced' | 'complained' | 'delivery_delayed' | null;
  lastEventAt?: string;
}

const statusConfig = {
  clicked: {
    label: 'Clicado',
    icon: MousePointerClick,
    variant: 'default' as const,
    className: 'bg-status-success text-white',
    description: 'Usuário clicou no link do convite'
  },
  opened: {
    label: 'Aberto',
    icon: MailOpen,
    variant: 'default' as const,
    className: 'bg-status-info text-white',
    description: 'Usuário abriu o email'
  },
  delivered: {
    label: 'Entregue',
    icon: CheckCircle2,
    variant: 'default' as const,
    className: 'bg-status-success/80 text-white',
    description: 'Email foi entregue na caixa de entrada'
  },
  sent: {
    label: 'Enviado',
    icon: Mail,
    variant: 'secondary' as const,
    className: '',
    description: 'Email foi enviado pelo servidor'
  },
  delivery_delayed: {
    label: 'Atrasado',
    icon: Clock,
    variant: 'default' as const,
    className: 'bg-status-warning text-white',
    description: 'Entrega do email está atrasada'
  },
  bounced: {
    label: 'Devolvido',
    icon: XCircle,
    variant: 'destructive' as const,
    className: '',
    description: 'Email não pôde ser entregue (endereço inválido)'
  },
  complained: {
    label: 'Spam',
    icon: AlertTriangle,
    variant: 'destructive' as const,
    className: '',
    description: 'Usuário marcou como spam'
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive' as const,
    className: '',
    description: 'Falha no envio do email'
  },
};

export function DeliveryStatusBadge({ status, lastEventAt }: DeliveryStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p className="font-medium">{config.description}</p>
            {lastEventAt && (
              <p className="text-muted-foreground mt-1">
                {formatDate(lastEventAt)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
