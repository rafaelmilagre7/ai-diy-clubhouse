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
                ? 'bg-status-warning/10 border-status-warning/30' 
                : 'bg-operational/10 border-operational/30'
            }`}>
              <p className={`text-sm ${
                isActive 
                  ? 'text-status-warning' 
                  : 'text-operational'
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
              ? "bg-status-warning text-primary-foreground hover:bg-status-warning/90" 
              : "bg-operational text-primary-foreground hover:bg-operational/90"
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