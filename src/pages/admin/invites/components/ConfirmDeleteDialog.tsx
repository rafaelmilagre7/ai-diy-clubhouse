
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
  // ⚡ OTIMIZAÇÃO UX - Fechar modal imediatamente e processar em background
  const handleConfirm = () => {
    // Fechar modal IMEDIATAMENTE para melhor UX
    onOpenChange(false);
    
    // Processar exclusão sem bloquear UI
    setTimeout(() => {
      onConfirm();
    }, 50); // 50ms para permitir que modal feche primeiro
  };
  
  if (!invite) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-dialog-form-sm">
        <DialogHeader>
          <DialogTitle>🗑️ Remover convite</DialogTitle>
          <DialogDescription>
            Confirmar remoção do convite para <strong>{invite.email}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-status-info/10 p-3 rounded-lg border border-status-info/20">
            <p className="text-sm text-status-info">
              ⚡ <strong>Exclusão otimizada:</strong> O convite será removido instantaneamente da lista. 
              A limpeza física será feita automaticamente em 24h.
            </p>
          </div>
          {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
            <p className="text-sm text-status-warning mt-3 p-2 bg-status-warning/10 rounded">
              ⚠️ Este convite ainda está ativo e não foi utilizado.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              "🗑️ Remover Agora"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
