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
import { useToggleUserStatus } from "@/hooks/admin/useToggleUserStatus";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ToggleUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export const ToggleUserStatusDialog: React.FC<ToggleUserStatusDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const { toggleUserStatus, isToggling } = useToggleUserStatus();

  const handleToggleStatus = async () => {
    if (!user) return;
    
    const success = await toggleUserStatus(user.id, user.email, user.status || 'active');
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    }
  };

  const isActive = user?.status === 'active';
  const actionText = isActive ? 'desativar' : 'reativar';
  const statusText = isActive ? 'desativado' : 'reativado';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Desativar usuário' : 'Reativar usuário'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja <strong>{actionText}</strong> o usuário <strong>{user?.name || user?.email}</strong>?
            
            <div className={`mt-4 p-3 rounded-md border ${
              isActive 
                ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' 
                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            }`}>
              <p className={`text-sm ${
                isActive 
                  ? 'text-orange-800 dark:text-orange-200' 
                  : 'text-green-800 dark:text-green-200'
              }`}>
                {isActive 
                  ? '🚫 O usuário será desativado e não poderá mais acessar a plataforma.' 
                  : '✅ O usuário será reativado e poderá acessar a plataforma novamente.'
                }
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isToggling}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleToggleStatus();
            }}
            disabled={isToggling}
            className={isActive 
              ? "bg-orange-600 text-white hover:bg-orange-700" 
              : "bg-green-600 text-white hover:bg-green-700"
            }
          >
            {isToggling ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Processando...</span>
              </>
            ) : (
              `Sim, ${actionText}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};