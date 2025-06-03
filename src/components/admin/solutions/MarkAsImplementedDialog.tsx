
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MarkAsImplementedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionId: string;
  solutionTitle: string;
  onSuccess: () => void;
}

export const MarkAsImplementedDialog: React.FC<MarkAsImplementedDialogProps> = ({
  open,
  onOpenChange,
  solutionId,
  solutionTitle,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsImplemented = async () => {
    setIsLoading(true);
    
    try {
      // Buscar o progresso existente ou criar um novo
      const { data: existingProgress } = await supabase
        .from('progress')
        .select('id')
        .eq('solution_id', solutionId)
        .single();

      if (existingProgress) {
        // Atualizar progresso existente
        const { error } = await supabase
          .from('progress')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Criar novo progresso como implementado
        const { error } = await supabase
          .from('progress')
          .insert({
            solution_id: solutionId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            completed_modules: []
          });

        if (error) throw error;
      }

      toast.success('Solução marcada como implementada com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao marcar solução como implementada:', error);
      toast.error('Erro ao marcar solução como implementada: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Marcar como Implementada
          </DialogTitle>
          <DialogDescription className="text-left">
            Você está prestes a marcar esta solução como implementada por um administrador.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-2 text-left">Solução: {solutionTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4 text-left">
            Esta ação irá marcar a solução como concluída no sistema. Isso afetará 
            as estatísticas e o progresso geral da plataforma.
          </p>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-100">
            <p className="text-sm text-blue-700 text-left">
              Como administrador, você pode marcar soluções como implementadas 
              para fins de demonstração ou testes.
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleMarkAsImplemented}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Marcar como Implementada"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
