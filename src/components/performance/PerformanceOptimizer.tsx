
import React from 'react';
import { LazyLoadingProvider } from './LazyLoadingProvider';
import { CoreWebVitalsOptimizer } from './CoreWebVitalsOptimizer';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { toast } from 'sonner';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  // Notificar usuário sobre atualizações disponíveis
  React.useEffect(() => {
    if (updateAvailable) {
      toast.info('Nova versão disponível!', {
        description: 'Clique para atualizar e aproveitar as melhorias.',
        action: {
          label: 'Atualizar',
          onClick: updateServiceWorker
        },
        duration: 10000
      });
    }
  }, [updateAvailable, updateServiceWorker]);

  return (
    <LazyLoadingProvider>
      <CoreWebVitalsOptimizer />
      {children}
    </LazyLoadingProvider>
  );
};
