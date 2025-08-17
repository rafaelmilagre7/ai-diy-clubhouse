
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
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Utilizado
      </Badge>
    );
  }

  // Verificar se expirou
  if (new Date(invite.expires_at) < new Date()) {
    return (
      <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
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
    <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
      <Clock className="h-3 w-3 mr-1" />
      Ativo
    </Badge>
  );
};

export default InviteStatus;
