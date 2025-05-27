
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PerformanceAlert {
  type: 'performance' | 'memory' | 'network';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp?: number;
}

interface RealTimeStats {
  activeQueries: number;
  avgResponseTime: number;
  memoryUsage: number;
  errorRate: number;
}

interface PerformanceContextType {
  realTimeStats: RealTimeStats;
  addAlert: (alert: PerformanceAlert) => void;
  isMonitoring: boolean;
  alerts: PerformanceAlert[];
  clearAlerts: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
  enableAutoAlerts?: boolean;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children, 
  enableAutoAlerts = true 
}) => {
  const [realTimeStats] = useState<RealTimeStats>({
    activeQueries: 0,
    avgResponseTime: 0,
    memoryUsage: 0,
    errorRate: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring] = useState(true);

  const addAlert = useCallback((alert: PerformanceAlert) => {
    const newAlert = {
      ...alert,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = {
    realTimeStats,
    addAlert,
    isMonitoring,
    alerts,
    clearAlerts
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
