
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SystemHealthStatus {
  database: boolean;
  authentication: boolean;
  storage: boolean;
  overall: 'healthy' | 'degraded' | 'critical';
  lastChecked: Date;
  errors: string[];
}

export const useSystemHealth = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus>({
    database: false,
    authentication: false,
    storage: false,
    overall: 'critical',
    lastChecked: new Date(),
    errors: []
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemHealth = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    const errors: string[] = [];
    let dbStatus = false;
    let authStatus = false;
    let storageStatus = false;

    try {
      // Verificar conectividade com o banco
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (dbError) {
        errors.push(`Database: ${dbError.message}`);
      } else {
        dbStatus = true;
      }
    } catch (error: any) {
      errors.push(`Database connection: ${error.message}`);
    }

    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      authStatus = !!session && !!user;
      
      if (!authStatus) {
        errors.push('Authentication: No valid session found');
      }
    } catch (error: any) {
      errors.push(`Authentication: ${error.message}`);
    }

    try {
      // Verificar storage
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        errors.push(`Storage: ${storageError.message}`);
      } else {
        storageStatus = true;
      }
    } catch (error: any) {
      errors.push(`Storage: ${error.message}`);
    }

    // Determinar status geral
    let overall: 'healthy' | 'degraded' | 'critical' = 'critical';
    const healthyServices = [dbStatus, authStatus, storageStatus].filter(Boolean).length;
    
    if (healthyServices === 3) {
      overall = 'healthy';
    } else if (healthyServices >= 2) {
      overall = 'degraded';
    }

    setHealthStatus({
      database: dbStatus,
      authentication: authStatus,
      storage: storageStatus,
      overall,
      lastChecked: new Date(),
      errors
    });

    setIsChecking(false);
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Verificar saúde do sistema a cada 5 minutos
    const interval = setInterval(checkSystemHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    healthStatus,
    isChecking,
    checkSystemHealth
  };
};
