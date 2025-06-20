
import { useState, useEffect, useCallback } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useCloudSync } from './useCloudSync';
import { useAuth } from '@/contexts/auth';

const STORAGE_KEY = 'viver-ia-onboarding-data';
const AUTO_SAVE_DELAY = 2000; // 2 segundos

export const useOnboardingStorage = () => {
  const { user } = useAuth();
  const { saveToCloud, loadFromCloud } = useCloudSync();
  
  const [data, setData] = useState<OnboardingData>({
    memberType: 'club',
    startedAt: new Date().toISOString()
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Se houver usuário logado, tentar carregar da nuvem primeiro
        if (user?.id) {
          const cloudData = await loadFromCloud();
          if (cloudData) {
            setData(cloudData);
            setLastSaved(cloudData.updatedAt ? new Date(cloudData.updatedAt) : new Date());
            setIsLoading(false);
            return;
          }
        }

        // Fallback para localStorage
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const parsedData = JSON.parse(localData);
          setData(parsedData);
          setLastSaved(parsedData.updatedAt ? new Date(parsedData.updatedAt) : new Date());
        }

        // Se o usuário estiver logado, atualizar o avatar se necessário
        if (user?.id && user.email) {
          const profileUpdate = {
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=0D8ABC&color=fff`
          };

          await supabase
            .from('profiles')
            .update(profileUpdate as any)
            .eq('id', user.id as any);
        }
      } catch (error) {
        console.error('[OnboardingStorage] Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id, loadFromCloud]);

  // Auto-save com debounce
  const scheduleSave = useCallback((newData: OnboardingData) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        // Salvar localmente
        const dataWithTimestamp = {
          ...newData,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
        
        // Salvar na nuvem se o usuário estiver logado
        if (user?.id) {
          await saveToCloud(dataWithTimestamp);
        }
        
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('[OnboardingStorage] Erro ao salvar:', error);
      }
    }, AUTO_SAVE_DELAY);

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout, user?.id, saveToCloud]);

  // Atualizar dados
  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prevData => {
      const updatedData = { ...prevData, ...newData };
      setHasUnsavedChanges(true);
      scheduleSave(updatedData);
      return updatedData;
    });
  }, [scheduleSave]);

  // Forçar salvamento imediato
  const forceSave = useCallback(async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }

    try {
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      
      if (user?.id) {
        await saveToCloud(dataWithTimestamp);
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('[OnboardingStorage] Erro ao forçar salvamento:', error);
      throw error;
    }
  }, [data, user?.id, saveToCloud, autoSaveTimeout]);

  // Limpar dados
  const clearData = useCallback(() => {
    const initialData: OnboardingData = {
      memberType: 'club',
      startedAt: new Date().toISOString()
    };
    
    setData(initialData);
    localStorage.removeItem(STORAGE_KEY);
    setHasUnsavedChanges(false);
    setLastSaved(null);
  }, []);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    updateData,
    forceSave,
    clearData,
    isLoading,
    hasUnsavedChanges,
    lastSaved
  };
};
