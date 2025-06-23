
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw } from 'lucide-react';
import { HealthCheckProgressDialog } from './HealthCheckProgressDialog';
import { useHealthCheckInitializer } from '@/hooks/admin/invites/useHealthCheckInitializer';
import { toast } from 'sonner';

interface HealthCheckInitButtonProps {
  onInitialized?: () => void;
}

export const HealthCheckInitButton = ({ onInitialized }: HealthCheckInitButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { progress, initialize, reset, isProcessing } = useHealthCheckInitializer();

  const handleInitialize = async () => {
    setDialogOpen(true);
    reset();
    
    try {
      await initialize();
      
      // Aguardar um pouco antes de chamar callback
      setTimeout(() => {
        onInitialized?.();
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro na inicialização:', error);
      toast.error('Erro na inicialização do Health Check');
    }
  };

  const handleCancel = () => {
    reset();
    setDialogOpen(false);
    toast.info('Inicialização cancelada');
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isProcessing) {
      setDialogOpen(false);
      reset();
    }
  };

  return (
    <>
      <Button
        onClick={handleInitialize}
        disabled={isProcessing}
        className="gap-2"
        variant="default"
        size="sm"
      >
        {isProcessing ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Activity className="h-4 w-4" />
        )}
        {isProcessing ? 'Inicializando...' : 'Inicializar Health Check'}
      </Button>

      <HealthCheckProgressDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        progress={progress}
        onCancel={progress.stage === 'processing' ? handleCancel : undefined}
      />
    </>
  );
};
