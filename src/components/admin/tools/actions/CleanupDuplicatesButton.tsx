
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fixToolsData } from '@/utils/toolDataFixer';

interface CleanupDuplicatesButtonProps {
  onCleanupComplete?: () => void;
}

export const CleanupDuplicatesButton = ({ onCleanupComplete }: CleanupDuplicatesButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleCleanup = async () => {
    if (isProcessing || isComplete) return;
    
    try {
      setIsProcessing(true);
      
      toast.info('Iniciando limpeza de ferramentas duplicadas...');
      
      const result = await fixToolsData();
      
      if (result) {
        toast.success('Limpeza de duplicatas concluída com sucesso!');
        setIsComplete(true);
        
        if (onCleanupComplete) {
          onCleanupComplete();
        }
      } else {
        toast.warning('Limpeza concluída com alguns avisos. Veja o console para detalhes.');
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Erro durante a limpeza de duplicatas:', error);
      toast.error('Erro ao limpar duplicatas. Veja o console para detalhes.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCleanup}
      disabled={isProcessing || isComplete}
      className="min-w-32"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Limpando...
        </>
      ) : isComplete ? (
        <>
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Limpeza concluída
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar duplicatas
        </>
      )}
    </Button>
  );
};
