
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { removeSpecificUsers } from '@/utils/completeUserRemoval';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CompleteUserRemovalButton = () => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleCompleteRemoval = async () => {
    setIsRemoving(true);
    try {
      await removeSpecificUsers();
    } catch (error) {
      console.error('Erro na remoção:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isRemoving}
        >
          {isRemoving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Removendo...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Finalizar Remoção do Auth
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar Remoção dos Usuários</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação irá remover completamente os usuários rafaelkinojo@gmail.com e rafaelmilagre@hotmail.com 
            do sistema de autenticação do Supabase. 
            <br /><br />
            <strong>Esta ação é irreversível</strong> e permitirá que esses emails sejam usados para novos cadastros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCompleteRemoval}
            disabled={isRemoving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? "Removendo..." : "Confirmar Remoção"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompleteUserRemovalButton;
