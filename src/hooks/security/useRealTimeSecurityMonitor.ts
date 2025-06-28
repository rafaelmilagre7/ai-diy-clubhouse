
import { useState, useEffect } from 'react';

export interface SecurityMetrics {
  activeThreats: number;
  blockedRequests: number;
  successfulLogins: number;
  failedLogins: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  totalEvents: number;
  criticalEvents: number;
  activeIncidents: number;
  anomaliesDetected: number;
}

export const useRealTimeSecurityMonitor = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeThreats: 0,
    blockedRequests: 0,
    successfulLogins: 0,
    failedLogins: 0,
    systemHealth: 'healthy',
    totalEvents: 0,
    criticalEvents: 0,
    activeIncidents: 0,
    anomaliesDetected: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Mock data loading
    const timer = setTimeout(() => {
      setMetrics({
        activeThreats: Math.floor(Math.random() * 5),
        blockedRequests: Math.floor(Math.random() * 100),
        successfulLogins: Math.floor(Math.random() * 1000),
        failedLogins: Math.floor(Math.random() * 50),
        systemHealth: 'healthy',
        totalEvents: Math.floor(Math.random() * 500) + 100,
        criticalEvents: Math.floor(Math.random() * 10),
        activeIncidents: Math.floor(Math.random() * 3),
        anomaliesDetected: Math.floor(Math.random() * 15)
      });
      setEvents([]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    metrics,
    isLoading,
    error: null,
    events
  };
};
