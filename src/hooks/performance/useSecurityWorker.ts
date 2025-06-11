
import { useRef, useCallback, useEffect } from 'react';

interface WorkerMessage {
  type: string;
  data: any;
}

interface WorkerResponse {
  type: string;
  data: any;
}

export const useSecurityWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const callbacksRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    // Criar worker apenas no cliente
    if (typeof window !== 'undefined' && !workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL('/src/workers/securityAnalysisWorker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const { type, data } = e.data;
          const callback = callbacksRef.current.get(type);
          if (callback) {
            callback(data);
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Erro no Security Worker:', error);
        };
      } catch (error) {
        console.warn('Web Workers não suportados, usando processamento síncrono:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const postMessage = useCallback((message: WorkerMessage, callback?: (data: any) => void) => {
    if (workerRef.current) {
      if (callback) {
        callbacksRef.current.set(`${message.type}_RESULT`, callback);
      }
      workerRef.current.postMessage(message);
    } else {
      // Fallback para processamento síncrono
      console.warn('Worker não disponível, processando sincronamente');
      if (callback) {
        setTimeout(() => callback(null), 0);
      }
    }
  }, []);

  const analyzeAnomalies = useCallback((events: any[], callback: (anomalies: any[]) => void) => {
    postMessage({ type: 'ANALYZE_ANOMALIES', data: { events } }, callback);
  }, [postMessage]);

  const processSecurityLogs = useCallback((logs: any[], callback: (result: any) => void) => {
    postMessage({ type: 'PROCESS_SECURITY_LOGS', data: { logs } }, callback);
  }, [postMessage]);

  const calculateRiskScore = useCallback((events: any[], callback: (score: number) => void) => {
    postMessage({ type: 'CALCULATE_RISK_SCORE', data: { events } }, callback);
  }, [postMessage]);

  return {
    analyzeAnomalies,
    processSecurityLogs,
    calculateRiskScore,
    isWorkerAvailable: !!workerRef.current
  };
};
