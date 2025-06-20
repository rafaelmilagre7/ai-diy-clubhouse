
import { Trash2 } from "lucide-react";
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

  const isUsed = !!invite.used_at;
  const isExpired = new Date(invite.expires_at) < new Date();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Excluir Convite
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem certeza que deseja excluir o convite para <strong>{invite.email}</strong>?
            </p>
            
            <div className="bg-red-50 p-3 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Status:</strong> {
                  isUsed ? 'Já utilizado' : 
                  isExpired ? 'Expirado' : 
                  'Ativo'
                }
              </p>
              <p className="text-sm text-red-800">
                <strong>Papel:</strong> {invite.role?.name || 'Desconhecido'}
              </p>
              <p className="text-sm text-red-800">
                <strong>Criado em:</strong> {new Date(invite.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. O convite será removido permanentemente.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Convite"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
