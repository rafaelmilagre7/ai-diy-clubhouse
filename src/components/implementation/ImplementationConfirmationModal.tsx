
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, AlertCircle } from 'lucide-react';

export interface ImplementationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isCompleting?: boolean;
  isLoading?: boolean; // Para compatibilidade com código existente
}

export const ImplementationConfirmationModal: React.FC<ImplementationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCompleting = false,
  isLoading = false,
}) => {
  // Usar qualquer um dos dois props para indicar estado de carregamento
  const loading = isCompleting || isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Implementação
          </DialogTitle>
          <DialogDescription>
            Você está prestes a confirmar que implementou esta solução com sucesso em seu negócio.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-2">Ao confirmar a implementação:</p>
          <ul className="space-y-1 list-disc list-inside text-sm">
            <li>Você receberá um certificado de conclusão</li>
            <li>Seu progresso será registrado</li>
            <li>Você poderá acessar recursos adicionais</li>
          </ul>
        </div>

        <DialogFooter>
          <Button 
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => onConfirm()}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processando...' : 'Confirmar Implementação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImplementationConfirmationModal;
