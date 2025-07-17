import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SyncStatus {
  localStep: number;
  serverStep: number;
  synchronized: boolean;
  lastSync: string;
  error?: string;
}

export const OnboardingSyncDebug: React.FC = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSyncStatus = async () => {
    if (!user?.id) return;
    
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_final')
        .select('current_step, updated_at, completed_steps, is_completed')
        .eq('user_id', user.id)
        .single();

      if (error) {
        setSyncStatus({
          localStep: 0,
          serverStep: 0,
          synchronized: false,
          lastSync: 'Erro',
          error: error.message
        });
        return;
      }

      // Simular dados locais para comparação
      const localData = JSON.parse(localStorage.getItem('onboarding_auto_save') || '{}');
      
      setSyncStatus({
        localStep: localData.step || 1,
        serverStep: data.current_step,
        synchronized: localData.step === data.current_step,
        lastSync: new Date(data.updated_at).toLocaleTimeString(),
        error: undefined
      });
    } catch (err: any) {
      setSyncStatus({
        localStep: 0,
        serverStep: 0,
        synchronized: false,
        lastSync: 'Erro',
        error: err.message
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 5000); // Verificar a cada 5s
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!syncStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Estado de Sincronização</h3>
        <button 
          onClick={checkSyncStatus}
          disabled={isChecking}
          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded disabled:opacity-50"
        >
          {isChecking ? '🔄' : '↻'} Verificar
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Local Step:</span>
          <span className="font-mono">{syncStatus.localStep}</span>
        </div>
        <div className="flex justify-between">
          <span>Server Step:</span>
          <span className="font-mono">{syncStatus.serverStep}</span>
        </div>
        <div className="flex justify-between">
          <span>Sincronizado:</span>
          <span className={`font-semibold ${syncStatus.synchronized ? 'text-green-500' : 'text-red-500'}`}>
            {syncStatus.synchronized ? '✅ Sim' : '❌ Não'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Última Sync:</span>
          <span className="font-mono text-muted-foreground">{syncStatus.lastSync}</span>
        </div>
        {syncStatus.error && (
          <div className="text-red-500 text-xs bg-red-50 p-1 rounded">
            {syncStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};