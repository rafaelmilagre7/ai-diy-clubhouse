
import { Mail, Calendar } from "lucide-react";
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
  resendingInvites?: Set<string>;
}

const SimpleInvitesList = ({ 
  invites, 
  onResend, 
  onDelete, 
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Email</TableHead>
            <TableHead className="font-medium">Papel</TableHead>
            <TableHead className="font-medium">Expira em</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id} className="hover:bg-muted/20">
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {invite.role?.name || "Indefinido"}
                </Badge>
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
