
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

interface ConfirmDeleteDialogProps {
  invite: Invite | null;
  onConfirm: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
}

const ConfirmDeleteDialog = ({ 
  invite,
  onConfirm,
  isOpen,
  onOpenChange,
  isDeleting
}: ConfirmDeleteDialogProps) => {
  if (!invite) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir convite</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o convite para <strong>{invite.email}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Esta ação não pode ser desfeita. O convite será permanentemente removido do sistema.</p>
          {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
            <p className="text-sm text-amber-500 mt-2">
              Atenção: este convite ainda está ativo e não foi utilizado.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
