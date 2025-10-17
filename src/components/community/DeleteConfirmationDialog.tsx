
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription,
  AlertDialogFooter, 
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onDelete,
  isDeleting,
  title = "Excluir item",
  description = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
}: DeleteConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-status-error/20">
              <Trash2 className="h-6 w-6 text-status-error" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>{description}</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete} 
            disabled={isDeleting}
            className="flex-1 bg-destructive hover:bg-destructive-dark text-white focus:ring-destructive"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Excluindo...
              </div>
            ) : (
              'Excluir'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
