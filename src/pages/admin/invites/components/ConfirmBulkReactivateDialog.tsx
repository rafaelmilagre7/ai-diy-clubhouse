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
import { Zap, RefreshCw } from "lucide-react";

interface ConfirmBulkReactivateDialogProps {
  expiredCount: number;
  onConfirm: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isBulkReactivating: boolean;
}

const ConfirmBulkReactivateDialog = ({
  expiredCount,
  onConfirm,
  isOpen,
  onOpenChange,
  isBulkReactivating
}: ConfirmBulkReactivateDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Reativar Convites Expirados
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja reativar <strong>{expiredCount} convites expirados</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta ação irá:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Estender a validade de todos os convites expirados por 7 dias</li>
              <li>Manter o convite válido apenas se ainda não foi utilizado</li>
              <li>Registrar a operação nos logs de auditoria</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBulkReactivating}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isBulkReactivating}
            className="bg-warning hover:bg-warning/90"
          >
            {isBulkReactivating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reativando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Reativar {expiredCount} Convites
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmBulkReactivateDialog;