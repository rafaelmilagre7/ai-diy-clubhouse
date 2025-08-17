import { Mail, Calendar, Phone, MessageCircle, Send, RefreshCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Invite } from "@/hooks/admin/invites/types";
import { formatDate } from "../utils/formatters";
import InviteStatus from "./InviteStatus";
import InviteActions from "./InviteActions";
import { EmailTrackingCell } from "@/components/admin/invites/EmailTrackingCell";
import { WhatsAppTrackingCell } from "@/components/admin/invites/WhatsAppTrackingCell";
import { useWhatsAppStatusCheck } from "@/hooks/admin/invites/useWhatsAppStatusCheck";

interface SimpleInvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  onReactivate?: () => void;
  resendingInvites?: Set<string>;
}

const SimpleInvitesList = ({ 
  invites, 
  onResend, 
  onDelete, 
  onReactivate,
  resendingInvites = new Set() 
}: SimpleInvitesListProps) => {
  const { checkWhatsAppStatus, isChecking, lastCheckResult } = useWhatsAppStatusCheck();

  const handleCheckWhatsAppStatus = async () => {
    await checkWhatsAppStatus();
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Nenhum convite encontrado</h3>
        <p>Crie o primeiro convite para começar a convidar usuários.</p>
      </div>
    );
  }

  const getChannelBadge = (channelPreference?: string, phone?: string) => {
    switch (channelPreference) {
      case 'whatsapp':
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </Badge>
        );
      case 'both':
        return (
          <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
            <Send className="h-3 w-3 mr-1" />
            Email + WhatsApp
          </Badge>
        );
      case 'email':
      default:
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Lista de Convites</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckWhatsAppStatus}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Verificar WhatsApp'}
          </Button>
        </div>
        {lastCheckResult && (
          <div className="text-sm text-muted-foreground">
            Última verificação: {lastCheckResult.checked} mensagens, {lastCheckResult.updated} atualizadas
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Destinatário</TableHead>
            <TableHead className="font-medium">Papel</TableHead>
            <TableHead className="font-medium">Canal</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">📧 Email</TableHead>
            <TableHead className="font-medium">📱 WhatsApp</TableHead>
            <TableHead className="font-medium">Expira em</TableHead>
            <TableHead className="font-medium text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{invite.email}</div>
                  {invite.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {invite.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {invite.role?.name || "Indefinido"}
                </Badge>
              </TableCell>
              <TableCell>
                {getChannelBadge(invite.channel_preference, invite.phone)}
              </TableCell>
              <TableCell>
                <InviteStatus invite={invite} />
              </TableCell>
              <TableCell>
                <EmailTrackingCell inviteId={invite.id} />
              </TableCell>
              <TableCell>
                <WhatsAppTrackingCell inviteId={invite.id} />
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(invite.expires_at)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <InviteActions
                  invite={invite}
                  onResend={onResend}
                  onDelete={onDelete}
                  onReactivate={onReactivate}
                  isResending={resendingInvites.has(invite.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
};

export default SimpleInvitesList;