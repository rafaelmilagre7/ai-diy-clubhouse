
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { InitializationProgress } from '@/hooks/admin/invites/useHealthCheckInitializer';

interface HealthCheckProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: InitializationProgress;
  onCancel?: () => void;
}

export const HealthCheckProgressDialog = ({
  open,
  onOpenChange,
  progress,
  onCancel
}: HealthCheckProgressDialogProps) => {
  const getStatusIcon = () => {
    switch (progress.stage) {
      case 'simulating':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    switch (progress.stage) {
      case 'simulating':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canClose = progress.stage === 'completed' || progress.stage === 'error';

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-md" hideClose={!canClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Inicializando Health Check
          </DialogTitle>
          <DialogDescription>
            Sistema de monitoramento de saúde dos usuários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{progress.message}</span>
              <span className="text-muted-foreground">{progress.progress}%</span>
            </div>
            
            <Progress 
              value={progress.progress} 
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>

          {progress.details && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {progress.details}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {progress.stage === 'processing' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
            
            {canClose && (
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                variant={progress.stage === 'completed' ? 'default' : 'destructive'}
              >
                {progress.stage === 'completed' ? 'Concluído' : 'Fechar'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
