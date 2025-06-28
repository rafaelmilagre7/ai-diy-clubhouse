
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HealthStatus {
  isHealthy: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'slow' | 'error';
  authStatus: 'authenticated' | 'unauthenticated' | 'error';
  databaseStatus: 'operational' | 'slow' | 'error';
  storageStatus: 'operational' | 'slow' | 'error';
  issues: string[];
  checkedAt: Date;
}

export const useSupabaseHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isHealthy: true,
    connectionStatus: 'connected',
    authStatus: 'authenticated',
    databaseStatus: 'operational',
    storageStatus: 'operational',
    issues: [],
    checkedAt: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    const issues: string[] = [];
    const startTime = Date.now();

    try {
      // Testar conexão básica
      const connectionTest = await supabase.from('profiles').select('count').limit(1);
      const connectionTime = Date.now() - startTime;
      
      let connectionStatus: HealthStatus['connectionStatus'] = 'connected';
      if (connectionTest.error) {
        connectionStatus = 'error';
        issues.push(`Erro de conexão: ${connectionTest.error.message}`);
      } else if (connectionTime > 3000) {
        connectionStatus = 'slow';
        issues.push('Conexão lenta detectada (>3s)');
      }

      // Testar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      const authStatus: HealthStatus['authStatus'] = authError || !user ? 'unauthenticated' : 'authenticated';
      if (authError) {
        issues.push(`Erro de autenticação: ${authError.message}`);
      }

      // Testar banco de dados usando query simples em vez de função inexistente
      const dbTest = await supabase.from('profiles').select('count').limit(1);
      const databaseStatus: HealthStatus['databaseStatus'] = dbTest.error ? 'error' : 'operational';
      if (dbTest.error) {
        issues.push(`Erro no banco: ${dbTest.error.message}`);
      }

      // Testar storage
      const storageTest = await supabase.storage.listBuckets();
      const storageStatus: HealthStatus['storageStatus'] = storageTest.error ? 'error' : 'operational';
      if (storageTest.error) {
        issues.push(`Erro no storage: ${storageTest.error.message}`);
      }

      setHealthStatus({
        isHealthy: issues.length === 0,
        connectionStatus,
        authStatus,
        databaseStatus,
        storageStatus,
        issues,
        checkedAt: new Date()
      });

    } catch (error) {
      console.error('Health check error:', error);
      setHealthStatus({
        isHealthy: false,
        connectionStatus: 'error',
        authStatus: 'error',
        databaseStatus: 'error',
        storageStatus: 'error',
        issues: [`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`],
        checkedAt: new Date()
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    performHealthCheck();
    
    // Check a cada 5 minutos
    const interval = setInterval(performHealthCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [performHealthCheck]);

  return {
    healthStatus,
    isChecking,
    performHealthCheck
  };
};
