
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

interface CloudSyncOptions {
  retryAttempts?: number;
  retryDelay?: number;
}

interface SyncResult {
  success: boolean;
  error?: string;
  timestamp: string;
}

export const useCloudSync = (options: CloudSyncOptions = {}) => {
  const { log, logError } = useLogging();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // CORREÇÃO: Como a tabela onboarding_sync não existe, 
  // vamos usar a tabela profiles para sincronização
  const syncToCloud = useCallback(async (data: any): Promise<SyncResult> => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      log('Iniciando sincronização com a nuvem', { dataKeys: Object.keys(data) });

      // Usar a tabela profiles para armazenar dados de onboarding
      const { error: syncError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user_id,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (syncError) {
        logError('Erro na sincronização', syncError);
        setSyncError(syncError.message);
        return {
          success: false,
          error: syncError.message,
          timestamp: new Date().toISOString()
        };
      }

      const timestamp = new Date().toISOString();
      setLastSync(timestamp);
      log('Sincronização concluída com sucesso');

      return {
        success: true,
        timestamp
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido na sincronização';
      logError('Erro inesperado na sincronização', error);
      setSyncError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    } finally {
      setIsSyncing(false);
    }
  }, [log, logError]);

  const getCloudData = useCallback(async (userId: string) => {
    try {
      log('Buscando dados da nuvem', { userId });

      // CORREÇÃO: Buscar da tabela profiles
      const { data, error } = await supabase
        .from("profiles")
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logError('Erro ao buscar dados da nuvem', error);
        throw error;
      }

      return data;
    } catch (error: any) {
      logError('Erro ao recuperar dados da nuvem', error);
      throw error;
    }
  }, [log, logError]);

  const clearCloudData = useCallback(async (userId: string) => {
    try {
      log('Limpando dados da nuvem', { userId });

      // CORREÇÃO: Atualizar a tabela profiles resetando campos de onboarding
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: false,
          onboarding_completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logError('Erro ao limpar dados da nuvem', error);
        throw error;
      }

      log('Dados da nuvem limpos com sucesso');
    } catch (error: any) {
      logError('Erro ao limpar dados da nuvem', error);
      throw error;
    }
  }, [log, logError]);

  return {
    syncToCloud,
    getCloudData,
    clearCloudData,
    isSyncing,
    lastSync,
    syncError,
    clearError: () => setSyncError(null)
  };
};
