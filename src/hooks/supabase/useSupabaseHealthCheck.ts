
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HealthCheckResult {
  isHealthy: boolean;
  issues: string[];
  checkedAt: Date;
  connectionStatus: 'connected' | 'disconnected' | 'slow';
  authStatus: 'authenticated' | 'unauthenticated' | 'error';
  databaseStatus: 'operational' | 'slow' | 'error';
  storageStatus: 'operational' | 'error' | 'untested';
}

export const useSupabaseHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult>({
    isHealthy: true,
    issues: [],
    checkedAt: new Date(),
    connectionStatus: 'connected',
    authStatus: 'unauthenticated',
    databaseStatus: 'operational',
    storageStatus: 'untested'
  });
  const [isChecking, setIsChecking] = useState(false);

  const performHealthCheck = async () => {
    setIsChecking(true);
    const issues: string[] = [];
    const startTime = performance.now();

    try {
      // 1. Verificar conexão com o banco
      let databaseStatus: 'operational' | 'slow' | 'error' = 'operational';
      try {
        const dbStart = performance.now();
        const { error: dbError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        const dbTime = performance.now() - dbStart;
        
        if (dbError) {
          issues.push(`Erro no banco de dados: ${dbError.message}`);
          databaseStatus = 'error';
        } else if (dbTime > 2000) {
          issues.push('Banco de dados respondendo lentamente');
          databaseStatus = 'slow';
        }
      } catch (error) {
        issues.push(`Erro de conexão com banco: ${error}`);
        databaseStatus = 'error';
      }

      // 2. Verificar autenticação
      let authStatus: 'authenticated' | 'unauthenticated' | 'error' = 'unauthenticated';
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          issues.push(`Erro de autenticação: ${authError.message}`);
          authStatus = 'error';
        } else if (session) {
          authStatus = 'authenticated';
        }
      } catch (error) {
        issues.push(`Erro no sistema de auth: ${error}`);
        authStatus = 'error';
      }

      // 3. Verificar storage (se possível)
      let storageStatus: 'operational' | 'error' | 'untested' = 'untested';
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        
        if (storageError) {
          issues.push(`Erro no storage: ${storageError.message}`);
          storageStatus = 'error';
        } else {
          storageStatus = 'operational';
        }
      } catch (error) {
        issues.push(`Erro ao verificar storage: ${error}`);
        storageStatus = 'error';
      }

      // 4. Verificar tempo de resposta geral
      const totalTime = performance.now() - startTime;
      let connectionStatus: 'connected' | 'disconnected' | 'slow' = 'connected';
      
      if (totalTime > 5000) {
        issues.push('Conexão muito lenta com Supabase');
        connectionStatus = 'slow';
      }

      const newHealthStatus: HealthCheckResult = {
        isHealthy: issues.length === 0,
        issues,
        checkedAt: new Date(),
        connectionStatus,
        authStatus,
        databaseStatus,
        storageStatus
      };

      setHealthStatus(newHealthStatus);

      // Mostrar notificação se houver problemas críticos
      if (issues.length > 0) {
        toast.error(`${issues.length} problema(s) detectado(s) no Supabase`, {
          description: issues.slice(0, 2).join(', ') + (issues.length > 2 ? '...' : '')
        });
      }

    } catch (error) {
      console.error('Erro durante health check:', error);
      setHealthStatus({
        isHealthy: false,
        issues: [`Erro crítico durante verificação: ${error}`],
        checkedAt: new Date(),
        connectionStatus: 'disconnected',
        authStatus: 'error',
        databaseStatus: 'error',
        storageStatus: 'error'
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Executar verificação inicial
  useEffect(() => {
    performHealthCheck();
  }, []);

  return {
    healthStatus,
    isChecking,
    performHealthCheck
  };
};
