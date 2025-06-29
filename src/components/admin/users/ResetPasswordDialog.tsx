
import React from 'react';
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
import { UserProfile } from "@/lib/supabase";
import { useResetPassword } from "@/hooks/admin/useResetPassword";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { resetUserPassword, isResetting } = useResetPassword();

  const handleResetPassword = async () => {
    if (!user) return;
    
    const success = await resetUserPassword(user.email);
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Redefinir senha do usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja enviar um e-mail de redefinição de senha para <strong>{user?.email}</strong>?
            <br /><br />
            Um link será enviado para o e-mail do usuário permitindo que ele defina uma nova senha.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Enviando...</span>
              </>
            ) : (
              "Enviar e-mail de redefinição"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
