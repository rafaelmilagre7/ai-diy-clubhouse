
import { useState, useEffect } from 'react';
import { perfMonitor } from '@/utils/performanceMonitor';

export const usePerformanceDashboard = () => {
  const [report, setReport] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const updateReport = () => {
      const currentReport = perfMonitor.getReport();
      setReport(currentReport);
    };

    // Atualizar report a cada 5 segundos
    const interval = setInterval(updateReport, 5000);
    
    // Atualizar imediatamente
    updateReport();

    // Tecla de atalho para mostrar/esconder dashboard
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
        updateReport();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const resetMetrics = () => {
    perfMonitor.reset();
    setReport(null);
  };

  return {
    report,
    isVisible,
    setIsVisible,
    resetMetrics
  };
};
