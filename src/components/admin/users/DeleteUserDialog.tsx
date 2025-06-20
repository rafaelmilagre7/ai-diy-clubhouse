
import { useState } from "react";
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

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const DeleteUserDialog = ({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserDialogProps) => {
  const { deleteUser, isDeleting } = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteUser(user.id, user.email);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão do usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir permanentemente o usuário{" "}
            <strong>{user.name || user.email}</strong>.
            Esta ação é irreversível e todos os dados relacionados ao usuário serão removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Usuário"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
