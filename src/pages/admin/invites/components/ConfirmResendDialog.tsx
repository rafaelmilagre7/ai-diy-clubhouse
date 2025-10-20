
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-form-sm">
        <DialogHeader>
          <DialogTitle>Reenviar convite</DialogTitle>
          <DialogDescription>
            Você está prestes a reenviar o convite para <strong>{invite.email}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Um novo email será enviado com o link de convite.</p>
          <p className="text-sm text-muted-foreground mt-2">
            O email será enviado com os dados do convite original.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Reenviar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmResendDialog;
