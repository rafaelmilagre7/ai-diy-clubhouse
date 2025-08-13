
import { Mail, Calendar, Phone, MessageCircle, Send } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Invite } from "@/hooks/admin/invites/types";
import { formatDate } from "../utils/formatters";
import InviteStatus from "./InviteStatus";
import InviteActions from "./InviteActions";

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
  if (invites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Nenhum convite encontrado</h3>
        <p>Crie o primeiro convite para começar a convidar usuários.</p>
      </div>
    );
  }

  const getChannelIcon = (channelPreference?: string) => {
    switch (channelPreference) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'both': return <Send className="h-4 w-4 text-purple-600" />;
      case 'email':
      default: 
        return <Mail className="h-4 w-4 text-blue-600" />;
    }
  };

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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Destinatário</TableHead>
            <TableHead className="font-medium">Papel</TableHead>
            <TableHead className="font-medium">Canal</TableHead>
            <TableHead className="font-medium">Expira em</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id} className="hover:bg-muted/20">
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
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(invite.expires_at)}
                </div>
              </TableCell>
              <TableCell>
                <InviteStatus invite={invite} />
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
  );
};

export default SimpleInvitesList;
