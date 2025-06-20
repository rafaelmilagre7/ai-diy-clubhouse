
import { useState, useCallback } from 'react';

interface ResendHealthStatus {
  isHealthy: boolean;
  healthy: boolean;
  apiKeyValid: boolean;
  connectivity: 'connected' | 'disconnected' | 'error';
  domainValid: boolean;
  responseTime: number;
  lastChecked: Date;
  issues: string[];
  lastError?: string;
  timestamp?: string;
  attempt?: number;
}

export const useResendHealthCheck = () => {
  const [status, setStatus] = useState<ResendHealthStatus>({
    isHealthy: true,
    healthy: true,
    apiKeyValid: true,
    connectivity: 'connected',
    domainValid: true,
    responseTime: 0,
    lastChecked: new Date(),
    issues: []
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    
    try {
      const startTime = Date.now();
      
      // Simular verificação de saúde
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const responseTime = Date.now() - startTime;
      
      const healthStatus = {
        isHealthy: true,
        responseTime,
        lastChecked: new Date(),
        healthy: true,
        apiKeyValid: true,
        connectivity: 'connected' as const,
        domainValid: true,
        issues: []
      };
      
      setStatus(healthStatus);
      
    } catch (error: any) {
      const healthStatus = {
        isHealthy: false,
        responseTime: 0,
        lastChecked: new Date(),
        healthy: false,
        apiKeyValid: false,
        connectivity: 'error' as const,
        domainValid: false,
        issues: [error.message],
        lastError: error.message
      };
      
      setStatus(healthStatus);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    status,
    isChecking,
    checkHealth
  };
};
