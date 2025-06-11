
import { useCallback } from 'react';

export const useSecurityWorker = () => {
  // Processamento simplificado sem Web Workers para compatibilidade
  const analyzeAnomalies = useCallback((events: any[], callback: (anomalies: any[]) => void) => {
    // Simular análise local
    setTimeout(() => {
      const mockAnomalies = [
        {
          id: 'anomaly-1',
          type: 'excessive_failed_logins',
          confidence: 0.85,
          description: 'Múltiplas tentativas de login detectadas'
        }
      ];
      callback(mockAnomalies);
    }, 1000);
  }, []);

  const processSecurityLogs = useCallback((logs: any[], callback: (result: any) => void) => {
    setTimeout(() => {
      callback({
        totalProcessed: logs.length,
        highSeverityCount: Math.floor(logs.length * 0.2)
      });
    }, 500);
  }, []);

  const calculateRiskScore = useCallback((events: any[], callback: (score: number) => void) => {
    setTimeout(() => {
      const score = Math.random() * 0.5; // Score baixo para demonstração
      callback(score);
    }, 300);
  }, []);

  return {
    analyzeAnomalies,
    processSecurityLogs,
    calculateRiskScore,
    isWorkerAvailable: false // Indicar que Web Workers não estão sendo usados
  };
};
