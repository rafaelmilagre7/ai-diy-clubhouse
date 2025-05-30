
import { useEffect, useRef, useState } from 'react';
import { QuickOnboardingData } from '@/types/quickOnboarding';

interface DebugEvent {
  id: string;
  timestamp: number;
  type: 'navigation' | 'validation' | 'save' | 'error' | 'user_action';
  step: number;
  message: string;
  data?: any;
}

export const useOnboardingDebug = (data: QuickOnboardingData, currentStep: number) => {
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(() => {
    return localStorage.getItem('onboarding-debug') === 'true' || 
           window.location.search.includes('debug=true');
  });
  
  const eventCounterRef = useRef(0);

  const addDebugEvent = (
    type: DebugEvent['type'], 
    message: string, 
    data?: any
  ) => {
    if (!isDebugMode) return;
    
    const event: DebugEvent = {
      id: `debug-${++eventCounterRef.current}`,
      timestamp: Date.now(),
      type,
      step: currentStep,
      message,
      data
    };

    setDebugEvents(prev => {
      const newEvents = [...prev, event];
      // Manter apenas os últimos 100 eventos
      if (newEvents.length > 100) {
        newEvents.splice(0, newEvents.length - 100);
      }
      return newEvents;
    });

    // Log no console também
    const logLevel = type === 'error' ? 'error' : type === 'validation' ? 'warn' : 'log';
    console[logLevel](`[Onboarding:${type}] Step ${currentStep}: ${message}`, data || '');
  };

  // Debug de mudanças de step
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      addDebugEvent('navigation', `Navegou do step ${prevStepRef.current} para ${currentStep}`);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  // Debug de mudanças nos dados
  const prevDataRef = useRef<string>('');
  useEffect(() => {
    const dataStr = JSON.stringify(data);
    if (prevDataRef.current && prevDataRef.current !== dataStr) {
      // Detectar quais campos mudaram
      try {
        const prevData = JSON.parse(prevDataRef.current);
        const changedFields: string[] = [];
        
        Object.keys(data).forEach(key => {
          if (JSON.stringify(data[key as keyof QuickOnboardingData]) !== 
              JSON.stringify(prevData[key])) {
            changedFields.push(key);
          }
        });
        
        if (changedFields.length > 0) {
          addDebugEvent('user_action', `Campos alterados: ${changedFields.join(', ')}`, {
            fields: changedFields,
            newValues: changedFields.reduce((acc, field) => {
              acc[field] = data[field as keyof QuickOnboardingData];
              return acc;
            }, {} as any)
          });
        }
      } catch (error) {
        addDebugEvent('error', 'Erro ao comparar dados para debug', error);
      }
    }
    prevDataRef.current = dataStr;
  }, [data]);

  // Função para exportar logs de debug
  const exportDebugLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      currentStep,
      totalEvents: debugEvents.length,
      events: debugEvents,
      userData: data
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onboarding-debug-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem('onboarding-debug', newMode.toString());
    
    if (newMode) {
      addDebugEvent('user_action', 'Debug mode ativado');
    }
  };

  // Limpar logs
  const clearDebugLogs = () => {
    setDebugEvents([]);
    addDebugEvent('user_action', 'Logs de debug limpos');
  };

  // Estatísticas de debug
  const debugStats = {
    totalEvents: debugEvents.length,
    eventsByType: debugEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    stepDistribution: debugEvents.reduce((acc, event) => {
      acc[event.step] = (acc[event.step] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  };

  return {
    isDebugMode,
    debugEvents,
    debugStats,
    addDebugEvent,
    exportDebugLogs,
    toggleDebugMode,
    clearDebugLogs
  };
};
