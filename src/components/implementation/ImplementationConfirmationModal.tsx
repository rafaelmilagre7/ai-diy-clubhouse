
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
import { Solution } from "@/lib/supabase";
import { Loader, CheckCircle } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";

interface ImplementationConfirmationModalProps {
  solution: Solution;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ImplementationConfirmationModal = ({
  solution,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ImplementationConfirmationModalProps) => {
  const { log } = useLogging();
  
  const handleConfirm = () => {
    log("User confirmed implementation", { 
      solution_id: solution.id, 
      solution_title: solution.title 
    });
    onConfirm();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-operational" />
            Confirmar Implementação
          </DialogTitle>
          <DialogDescription>
            Você está prestes a confirmar que implementou esta solução com sucesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-2">Solução: {solution.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A confirmação de implementação não pode ser desfeita. Isso ajuda a acompanhar 
            seu progresso no VIVER DE IA e libera acesso para certificados e benefícios.
          </p>
          
          <div className="bg-operational/10 p-3 rounded border border-operational/20">
            <p className="text-sm text-operational">
              Ao confirmar, você declara que implementou com sucesso esta solução 
              em sua empresa ou ambiente de negócios.
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
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
