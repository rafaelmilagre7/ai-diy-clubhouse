
import { LearningModule } from "@/lib/supabase";
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
import { Trash2 } from "lucide-react";

interface ModuloDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  modulo: LearningModule | null;
  isDeleting?: boolean;
}

export const ModuloDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  modulo,
  isDeleting = false
}: ModuloDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-enhanced border-destructive/20 max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Tem certeza?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o módulo{" "}
            <span className="font-semibold text-text-primary bg-destructive/10 px-2 py-1 rounded-md">
              {modulo?.title}
            </span>{" "}
            e todas as aulas associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="w-full sm:w-auto border-border/50 hover:bg-muted/50"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-gradient-to-r from-destructive to-destructive/80 
                     hover:from-destructive/90 hover:to-destructive/70 text-destructive-foreground 
                     shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Módulo
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
