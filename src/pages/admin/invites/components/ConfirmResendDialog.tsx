
import { Mail, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Invite } from "@/hooks/admin/invites/types";

interface ConfirmResendDialogProps {
  invite: Invite | null;
  onConfirm: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSending: boolean;
}

const ConfirmResendDialog = ({ 
  invite, 
  onConfirm, 
  isOpen, 
  onOpenChange, 
  isSending 
}: ConfirmResendDialogProps) => {
  if (!invite) return null;

  const inviteUrl = `${window.location.origin}/accept-invite/${invite.token}`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Reenviar Convite
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Deseja reenviar o convite para <strong>{invite.email}</strong>?
            </p>
            
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Papel:</strong> {invite.role?.name || 'Desconhecido'}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Expira em:</strong> {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Link do convite:</p>
              <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                {inviteUrl}
              </p>
            </div>

            {invite.send_attempts && invite.send_attempts > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Este convite já foi enviado {invite.send_attempts} vez(es)
                </span>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} disabled={isSending}>
              {isSending ? "Enviando..." : "Reenviar Email"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmResendDialog;
