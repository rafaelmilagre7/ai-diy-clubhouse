
import { CheckCircle, XCircle, Clock, Eye, MousePointer, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Invite } from "@/hooks/admin/invites/types";
import { TrackingStatusBadge } from "@/components/admin/invites/TrackingStatusBadge";
import { useInviteDeliveries } from "@/hooks/admin/invites/useInviteDeliveries";

interface InviteStatusProps {
  invite: Invite;
}

const InviteStatus = ({ invite }: InviteStatusProps) => {
  const { deliveries, getBestStatus } = useInviteDeliveries(invite.id);
  
  // Verificar se foi usado
  if (invite.used_at) {
    return (
      <Badge variant="secondary" className="bg-status-success-lighter text-status-success border-status-success/20">
        <CheckCircle className="h-3 w-3 mr-1" />
        Utilizado
      </Badge>
    );
  }

  // Verificar se expirou
  if (new Date(invite.expires_at) < new Date()) {
    return (
      <Badge variant="destructive" className="bg-status-error-lighter text-status-error border-status-error/20">
        <XCircle className="h-3 w-3 mr-1" />
        Expirado
      </Badge>
    );
  }

  // Se tem deliveries, usar o sistema de tracking
  if (deliveries && deliveries.length > 0) {
    const bestStatus = getBestStatus(deliveries);
    return (
      <TrackingStatusBadge
        status={bestStatus.status}
        channel={bestStatus.channel}
        metadata={bestStatus.metadata}
      />
    );
  }

  // Fallback para o status básico
  return (
    <Badge variant="default" className="bg-status-info-lighter text-status-info border-status-info/20">
      <Clock className="h-3 w-3 mr-1" />
      Ativo
    </Badge>
  );
};

export default InviteStatus;
