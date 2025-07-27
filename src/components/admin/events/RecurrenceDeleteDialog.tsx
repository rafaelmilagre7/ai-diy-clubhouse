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

interface RecurrenceDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: 'this' | 'future' | 'all') => void;
  eventTitle: string;
}

export const RecurrenceDeleteDialog = ({ 
  isOpen, 
  onClose, 
  onChoice,
  eventTitle 
}: RecurrenceDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Excluir Evento Recorrente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-2">
            <div>
              Você está tentando excluir um evento recorrente:
            </div>
            <div className="font-medium text-foreground">
              "{eventTitle}"
            </div>
            <div>
              Como deseja proceder?
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col space-y-2 sm:space-y-2 sm:space-x-0">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onChoice('this')}
            className="w-full justify-start"
          >
            Excluir apenas este evento
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onChoice('future')}
            className="w-full justify-start"
          >
            Excluir este e eventos futuros
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onChoice('all')}
            className="w-full justify-start"
          >
            Excluir toda a série de eventos
          </Button>
          
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" className="w-full">
              Cancelar
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};