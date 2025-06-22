
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAdminUserDelete } from "@/hooks/admin/users/useAdminUserDelete";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ForceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete?: {
    id: string;
    email: string;
    name?: string;
  };
  onSuccess?: () => void;
}

export const ForceDeleteDialog: React.FC<ForceDeleteDialogProps> = ({
  open,
  onOpenChange,
  userToDelete,
  onSuccess
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const { deleteUser, isDeleting } = useAdminUserDelete();

  const expectedConfirmation = userToDelete?.email || '';
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleDelete = async () => {
    if (!userToDelete || !isConfirmationValid) return;
    
    try {
      const success = await deleteUser(userToDelete.id, userToDelete.email);
      
      if (success && onSuccess) {
        onSuccess();
        onOpenChange(false);
        setConfirmationText('');
      }
    } catch (error) {
      console.error('Erro na exclusão:', error);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setConfirmationText('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            🗑️ Exclusão Total de Usuário
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL
                </p>
              </div>
              <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                <li>• Remove COMPLETAMENTE o usuário do sistema</li>
                <li>• Exclui da tabela auth.users</li>
                <li>• Libera o email para novos registros</li>
                <li>• Backup automático é criado</li>
              </ul>
            </div>
            
            {userToDelete && (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Usuário:</strong> {userToDelete.name || 'Sem nome'}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {userToDelete.email}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Digite o email do usuário para confirmar a exclusão:
              </Label>
              <Input
                id="confirmation"
                type="email"
                placeholder={expectedConfirmation}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                disabled={isDeleting}
                className={isConfirmationValid && confirmationText ? 'border-green-300' : ''}
              />
              {confirmationText && !isConfirmationValid && (
                <p className="text-xs text-red-600">
                  O email deve corresponder exatamente
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || !isConfirmationValid}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Excluindo...
              </>
            ) : (
              "🗑️ EXCLUIR COMPLETAMENTE"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
