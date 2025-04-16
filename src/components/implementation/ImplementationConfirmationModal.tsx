
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Solution } from "@/lib/supabase";

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
  onConfirm
}: ImplementationConfirmationModalProps) => {
  const [confirmChecked, setConfirmChecked] = useState(false);
  
  const confirmationRequirements = [
    "Eu li todo o conteúdo dos módulos desta solução",
    "Eu implementei esta solução na minha empresa",
    "Estou ciente que esta ação não pode ser desfeita",
    "Entendo que esta confirmação será utilizada para métricas e relatórios"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Confirmar Implementação Completa
          </DialogTitle>
          <DialogDescription>
            Você está prestes a marcar a solução <span className="font-semibold">{solution.title}</span> como completamente implementada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md flex">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              Ao confirmar, você está declarando que realmente implementou esta solução em seu negócio. 
              Esta confirmação será usada para cálculos de ROI e impacto dos resultados.
            </div>
          </div>
        
          <div className="space-y-2">
            {confirmationRequirements.map((req, i) => (
              <div key={i} className="flex items-start space-x-2">
                <Checkbox 
                  id={`confirm-req-${i}`} 
                  checked={confirmChecked} 
                  onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                />
                <label 
                  htmlFor={`confirm-req-${i}`} 
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {req}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!confirmChecked || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">●</span> 
                Processando...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" /> 
                Confirmar Implementação
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
