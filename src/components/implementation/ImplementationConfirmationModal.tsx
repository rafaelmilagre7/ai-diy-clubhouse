
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface ImplementationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ImplementationConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: ImplementationConfirmationModalProps) => {
  const { log } = useLogging();
  
  const handleConfirm = () => {
    log("User confirmed implementation");
    onConfirm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Implementação
          </DialogTitle>
          <DialogDescription>
            Você está prestes a confirmar que implementou esta solução com sucesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            A confirmação de implementação não pode ser desfeita. Isso ajuda a acompanhar 
            seu progresso no VIVER DE IA Club e libera acesso para certificados e benefícios.
          </p>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <p className="text-sm text-blue-700">
              Ao confirmar, você declara que implementou com sucesso esta solução 
              em sua empresa ou ambiente de negócios.
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Implementação"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
