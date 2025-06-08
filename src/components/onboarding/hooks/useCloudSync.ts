
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { OnboardingData } from '../types/onboardingTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
}

export const useCloudSync = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncError: null
  });

  const saveToCloud = useCallback(async (data: OnboardingData) => {
    if (!user?.id) return;

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

      const syncData = {
        user_id: user.id,
        data: data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('onboarding_sync')
        .upsert(syncData, { onConflict: 'user_id' });

      if (error) throw error;

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: null
      }));

      console.log('[useCloudSync] Dados salvos na nuvem com sucesso');
    } catch (error) {
      console.error('[useCloudSync] Erro ao salvar na nuvem:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: 'Erro ao salvar na nuvem'
      }));
      handleError(error, 'useCloudSync.saveToCloud', { showToast: false });
    }
  }, [user?.id, handleError]);

  const loadFromCloud = useCallback(async (): Promise<OnboardingData | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('onboarding_sync')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      console.log('[useCloudSync] Dados carregados da nuvem');
      return data?.data || null;
    } catch (error) {
      console.error('[useCloudSync] Erro ao carregar da nuvem:', error);
      handleError(error, 'useCloudSync.loadFromCloud', { showToast: false });
      return null;
    }
  }, [user?.id, handleError]);

  const clearCloudData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('onboarding_sync')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('[useCloudSync] Dados da nuvem removidos');
    } catch (error) {
      console.error('[useCloudSync] Erro ao limpar dados da nuvem:', error);
      handleError(error, 'useCloudSync.clearCloudData', { showToast: false });
    }
  }, [user?.id, handleError]);

  return {
    syncStatus,
    saveToCloud,
    loadFromCloud,
    clearCloudData
  };
};
