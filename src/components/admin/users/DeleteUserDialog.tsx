
import React, { useState } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [softDelete, setSoftDelete] = useState(true);

  const handleDeleteUser = async () => {
    if (!user) return;
    
    const success = await deleteUser(user.id, user.email, softDelete);
    
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
          <AlertDialogTitle>
            {softDelete ? 'Limpar dados do usuário' : 'Excluir usuário completamente'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Tem certeza que deseja {softDelete ? 'limpar os dados' : 'excluir permanentemente'} do usuário <strong>{user?.name || user?.email}</strong>?
            </p>
            
            <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <Switch
                id="soft-delete"
                checked={softDelete}
                onCheckedChange={setSoftDelete}
              />
              <Label htmlFor="soft-delete" className="text-sm">
                Usar soft delete (recomendado)
              </Label>
            </div>

            {softDelete ? (
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  ✅ Soft Delete - Recomendado:
                </p>
                <ul className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-1">
                  <li>• Limpa todos os dados pessoais e de progresso</li>
                  <li>• Mantém o usuário no sistema de autenticação</li>
                  <li>• Permite reenvio de convites imediatamente</li>
                  <li>• Mais seguro e rápido</li>
                </ul>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  ⚠️ Exclusão Completa:
                </p>
                <ul className="text-xs text-orange-700 dark:text-orange-300 mt-1 space-y-1">
                  <li>• Remove completamente do sistema de autenticação</li>
                  <li>• Limpa todos os dados associados</li>
                  <li>• Ação irreversível</li>
                  <li>• Pode falhar em casos específicos</li>
                </ul>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Dica:</strong> Use soft delete se quiser apenas permitir o reenvio de convites. 
                É mais seguro e resolve o problema de "usuário já registrado".
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
            className={softDelete ? "bg-blue-600 hover:bg-blue-700" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Processando...</span>
              </>
            ) : (
              softDelete ? "Limpar dados" : "Excluir completamente"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
