import { useCallback } from 'react';

/**
 * Hook especializado para logs temporizados detalhados
 */
export const useTimedLogger = () => {
  
  const createTimer = useCallback((name: string) => {
    const startTime = performance.now();
    const startTimestamp = new Date().toISOString();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        const logData = {
          name,
          startTime: startTimestamp,
          endTime: new Date().toISOString(),
          duration: Math.round(duration),
          durationMs: duration,
          ...metadata
        };
        
        console.log(`⏱️ [TIMER-${name.toUpperCase()}]`, JSON.stringify(logData));
        return duration;
      },
      checkpoint: (checkpointName: string, metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        const logData = {
          name,
          checkpoint: checkpointName,
          elapsedTime: Math.round(duration),
          timestamp: new Date().toISOString(),
          ...metadata
        };
        
        console.log(`🔍 [CHECKPOINT-${name.toUpperCase()}]`, JSON.stringify(logData));
        return duration;
      }
    };
  }, []);

  const logProcessPhase = useCallback((phaseName: string, data?: Record<string, any>) => {
    const logData = {
      phase: phaseName,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    console.log(`🔄 [PHASE-${phaseName.toUpperCase()}]`, JSON.stringify(logData));
  }, []);

  const logPerformanceAlert = useCallback((type: 'warning' | 'error', message: string, data?: Record<string, any>) => {
    const alertSymbol = type === 'error' ? '🚨' : '⚠️';
    const logData = {
      alertType: type,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    console.log(`${alertSymbol} [PERFORMANCE-${type.toUpperCase()}]`, JSON.stringify(logData));
  }, []);

  const measureAsync = useCallback(async <T>(
    name: string, 
    asyncFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; duration: number }> => {
    const timer = createTimer(name);
    
    try {
      timer.checkpoint('start', { ...metadata, status: 'starting' });
      const result = await asyncFunction();
      const duration = timer.end({ ...metadata, status: 'success' });
      
      return { result, duration };
    } catch (error: any) {
      const duration = timer.end({ ...metadata, status: 'error', error: error.message });
      throw error;
    }
  }, [createTimer]);

  return {
    createTimer,
    logProcessPhase,
    logPerformanceAlert,
    measureAsync
  };
};