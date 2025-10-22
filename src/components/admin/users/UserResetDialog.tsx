
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resetar Configuração Inicial</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja resetar a configuração inicial de {userName}?
            Esta ação irá remover todos os dados de configuração e o usuário precisará
            refazer o processo de configuração inicial.
            
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground">
            Sim, resetar configuração
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
