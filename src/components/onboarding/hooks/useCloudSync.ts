
import { useState, useEffect, useCallback } from 'react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Backoff exponencial

export const useCloudSync = () => {
  const { user } = useSimpleAuth();
  const { handleError } = useErrorHandler();
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    retryCount: 0
  });

  // Função de retry com backoff exponencial
  const retryWithBackoff = async (fn: () => Promise<any>, retryCount = 0): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount] || 5000;
        console.warn(`[CloudSync] Tentativa ${retryCount + 1} falhou, tentando novamente em ${delay}ms...`);
        
        setSyncStatus(prev => ({ ...prev, retryCount: retryCount + 1 }));
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retryCount + 1);
      }
      throw error;
    }
  };

  const saveToCloud = useCallback(async (data: OnboardingData) => {
    if (!user?.id) {
      console.log('[CloudSync] Usuário não logado - pulando sync na nuvem');
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null, retryCount: 0 }));

    try {
      const syncOperation = async () => {
        const syncData = {
          user_id: user.id,
          data: data,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('onboarding_sync')
          .upsert(syncData as any, { onConflict: 'user_id' });

        if (error) throw error;
      };

      await retryWithBackoff(syncOperation);

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: null,
        retryCount: 0
      }));

      console.log('[CloudSync] Dados salvos na nuvem com sucesso');
    } catch (error) {
      console.error('[CloudSync] Erro ao salvar na nuvem após todas as tentativas:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: 'Falha na sincronização (dados salvos localmente)',
        retryCount: 0
      }));
      
      // Log do erro mas não mostrar toast para o usuário
      handleError(error, 'CloudSync.saveToCloud', { showToast: false });
    }
  }, [user?.id, handleError]);

  const loadFromCloud = useCallback(async (): Promise<OnboardingData | null> => {
    if (!user?.id) {
      console.log('[CloudSync] Usuário não logado - não é possível carregar da nuvem');
      return null;
    }

    try {
      const loadOperation = async () => {
        const { data, error } = await supabase
          .from('onboarding_sync')
          .select('data, updated_at')
          .eq('user_id', user.id as any)
          .maybeSingle();

        if (error) throw error;
        return data;
      };

      const result = await retryWithBackoff(loadOperation);
      
      if (result) {
        console.log('[CloudSync] Dados carregados da nuvem');
        return { ...result.data, updatedAt: result.updated_at };
      }
      
      return null;
    } catch (error) {
      console.error('[CloudSync] Erro ao carregar da nuvem:', error);
      handleError(error, 'CloudSync.loadFromCloud', { showToast: false });
      return null;
    }
  }, [user?.id, handleError]);

  const clearCloudData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const clearOperation = async () => {
        const { error } = await supabase
          .from('onboarding_sync')
          .delete()
          .eq('user_id', user.id as any);

        if (error) throw error;
      };

      await retryWithBackoff(clearOperation);
      console.log('[CloudSync] Dados da nuvem removidos');
    } catch (error) {
      console.error('[CloudSync] Erro ao limpar dados da nuvem:', error);
      handleError(error, 'CloudSync.clearCloudData', { showToast: false });
    }
  }, [user?.id, handleError]);

  return {
    syncStatus,
    saveToCloud,
    loadFromCloud,
    clearCloudData
  };
};
