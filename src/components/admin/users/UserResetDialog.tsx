
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { UserProfile } from "@/lib/supabase";

interface UserResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user: UserProfile | null;
}

export const UserResetDialog: React.FC<UserResetDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  user
}) => {
  const userName = user?.name || user?.email || "usuário";

  const handleConfirm = () => {
    // Aqui seria implementada a lógica de reset do usuário
    onSuccess();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="aurora-glass">
        <AlertDialogHeader>
          <AlertDialogTitle className="aurora-text-gradient">Resetar Configuração Inicial</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja resetar a configuração inicial de <span className="font-semibold text-foreground">{userName}</span>?
            Esta ação irá remover todos os dados de configuração e o usuário precisará
            refazer o processo de configuração inicial.
            <br /><br />
            <span className="text-destructive font-medium">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AdminButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </AdminButton>
          <AdminButton variant="destructive" onClick={handleConfirm}>
            Sim, resetar configuração
          </AdminButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
