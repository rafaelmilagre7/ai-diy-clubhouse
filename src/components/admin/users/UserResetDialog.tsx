
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

interface UserResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName?: string;
}

export const UserResetDialog: React.FC<UserResetDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  userName = "usuário"
}) => {
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
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Sim, resetar configuração
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
