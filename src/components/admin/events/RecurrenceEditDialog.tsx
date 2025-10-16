import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Clock } from "lucide-react";

interface RecurrenceEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: 'this' | 'future' | 'all') => void;
}

export const RecurrenceEditDialog = ({ isOpen, onClose, onChoice }: RecurrenceEditDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-aurora-primary" />
            Editar Evento Recorrente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Este é um evento recorrente. Escolha como deseja aplicar as alterações:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={() => onChoice('this')}
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-aurora-primary mt-0.5" />
              <div className="text-left">
                <div className="font-medium">Apenas este evento</div>
                <div className="text-sm text-text-muted">
                  Altera somente esta ocorrência específica
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={() => onChoice('future')}
          >
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-operational mt-0.5" />
              <div className="text-left">
                <div className="font-medium">Este e eventos futuros</div>
                <div className="text-sm text-text-muted">
                  Altera esta ocorrência e todas as futuras
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={() => onChoice('all')}
          >
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-strategy mt-0.5" />
              <div className="text-left">
                <div className="font-medium">Toda a série de eventos</div>
                <div className="text-sm text-text-muted">
                  Altera todos os eventos desta série recorrente
                </div>
              </div>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};