
import { useState, useEffect } from 'react';

export interface SecurityMetrics {
  activeThreats: number;
  blockedRequests: number;
  successfulLogins: number;
  failedLogins: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const useRealTimeSecurityMonitor = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeThreats: 0,
    blockedRequests: 0,
    successfulLogins: 0,
    failedLogins: 0,
    systemHealth: 'healthy'
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const timer = setTimeout(() => {
      setMetrics({
        activeThreats: Math.floor(Math.random() * 5),
        blockedRequests: Math.floor(Math.random() * 100),
        successfulLogins: Math.floor(Math.random() * 1000),
        failedLogins: Math.floor(Math.random() * 50),
        systemHealth: 'healthy'
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    metrics,
    isLoading,
    error: null
  };
};
