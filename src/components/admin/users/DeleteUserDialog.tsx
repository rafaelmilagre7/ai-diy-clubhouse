
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
    
    const success = await deleteUser(user.id, user.email);
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário completamente</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem certeza que deseja excluir permanentemente o usuário <strong>{user?.name || user?.email}</strong>?
            </p>
            
            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                ⚠️ Esta ação é irreversível e irá:
              </p>
              <ul className="text-xs text-orange-700 dark:text-orange-300 mt-1 space-y-1">
                <li>• Remover completamente o usuário do sistema de autenticação</li>
                <li>• Limpar todos os dados associados (progresso, comentários, notificações)</li>
                <li>• Permitir que novos convites sejam criados para este email</li>
                <li>• Registrar a ação nos logs de auditoria</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300">
                ✅ Após a exclusão, você poderá criar um novo convite para <strong>{user?.email}</strong> sem problemas.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
                <span>Excluindo...</span>
              </>
            ) : (
              "Excluir completamente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
