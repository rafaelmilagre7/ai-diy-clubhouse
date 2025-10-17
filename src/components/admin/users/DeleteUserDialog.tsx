
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
import { useDeleteUser } from "@/hooks/admin/useDeleteUser";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const { deleteUser, isDeleting } = useDeleteUser();

  const handleDeleteUser = async () => {
    if (!user) return;
    
    const success = await deleteUser(user.id, user.email, false, true); // Hard delete + complete delete sempre
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remover usuário
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>COMPLETAMENTE</strong> o usuário <strong>{user?.name || user?.email}</strong>?
            
            <div className="mt-4 p-3 bg-status-error/10 rounded-md border border-status-error/30">
              <p className="text-sm text-status-error">
                ⚠️ Esta ação é <strong>irreversível</strong> e removerá o usuário completamente da plataforma.
              </p>
            </div>
          </AlertDialogDescription>

        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Não
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDeleteUser();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Removendo...</span>
              </>
            ) : (
              "Sim, remover"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
