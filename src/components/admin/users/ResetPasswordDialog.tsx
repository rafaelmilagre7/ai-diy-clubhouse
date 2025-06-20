
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/supabase";
import { useResetPassword } from "@/hooks/admin/useResetPassword";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export const ResetPasswordDialog = ({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) => {
  const { resetPassword, isResetting } = useResetPassword();

  const handleResetPassword = async () => {
    if (!user?.email) return;

    try {
      await resetPassword(user.email);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha do usuário</DialogTitle>
          <DialogDescription>
            Um email de redefinição de senha será enviado para{" "}
            <strong>{user.email}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResetting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? "Enviando..." : "Enviar Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
