
import { useState, useCallback } from 'react';
import { useCloudSync } from './useCloudSync';
import { OnboardingData } from '../types/onboardingTypes';

export const useOnboardingStorage = () => {
  const { syncToCloud, getCloudData, clearCloudData, isSyncing } = useCloudSync();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save function
  const autoSave = useCallback(async (data: OnboardingData, userId: string) => {
    try {
      const result = await syncToCloud({ ...data, user_id: userId });
      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Erro no auto-save:', error);
    }
  }, [syncToCloud]);

  // Force save function
  const forceSave = useCallback(async (data: OnboardingData, userId: string) => {
    const result = await syncToCloud({ ...data, user_id: userId });
    if (result.success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
    return result;
  }, [syncToCloud]);

  // Load data function
  const loadData = useCallback(async (userId: string) => {
    try {
      const data = await getCloudData(userId);
      return data;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  }, [getCloudData]);

  // Clear data function
  const clearData = useCallback(async (userId: string) => {
    try {
      await clearCloudData(userId);
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }, [clearCloudData]);

  return {
    autoSave,
    forceSave,
    loadData,
    clearData,
    lastSaved,
    hasUnsavedChanges,
    setLastSaved,
    setHasUnsavedChanges,
    isSyncing
  };
};
