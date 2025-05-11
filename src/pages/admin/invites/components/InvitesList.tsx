
import { Mail, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Invite } from "@/hooks/admin/invites/types";
import { formatDate } from "../utils/formatters";

interface InvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
}

const InvitesList = ({ invites, onResend, onDelete }: InvitesListProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado para área de transferência");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Envio</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.length > 0 ? (
          invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {invite.role?.name || "Desconhecido"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(invite.expires_at)}</span>
                </div>
              </TableCell>
              <TableCell>
                {invite.used_at ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Utilizado
                  </Badge>
                ) : new Date(invite.expires_at) < new Date() ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Expirado
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Ativo
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {invite.last_sent_at ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {invite.send_attempts || 0}x 
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enviado {invite.send_attempts || 0} vezes</p>
                        <p>Último envio: {formatDate(invite.last_sent_at)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-muted-foreground text-sm">Pendente</span>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/convite/${invite.token}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar link de convite</p>
                    </TooltipContent>
                  </Tooltip>
                
                  {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onResend(invite)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reenviar convite</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(invite)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir convite</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
              Nenhum convite encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvitesList;
