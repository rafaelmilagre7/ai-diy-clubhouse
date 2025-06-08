
import { useState, useEffect } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useCloudSync } from './useCloudSync';
import { useAuth } from '@/contexts/auth';

const STORAGE_KEY = 'viver-ia-onboarding-data';

export const useOnboardingStorage = () => {
  const { user } = useAuth();
  const { saveToCloud, loadFromCloud, clearCloudData, syncStatus } = useCloudSync();
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Tentar carregar da nuvem primeiro (se logado)
        if (user?.id) {
          const cloudData = await loadFromCloud();
          if (cloudData) {
            setData(cloudData);
            // Sincronizar com localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
            return;
          }
        }

        // Fallback para localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setData(parsedData);
          
          // Se logado, salvar na nuvem
          if (user?.id) {
            await saveToCloud(parsedData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id, loadFromCloud, saveToCloud]);

  // Atualizar dados
  const updateData = async (newData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    
    try {
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      
      // Salvar na nuvem (se logado)
      if (user?.id) {
        await saveToCloud(updatedData);
      }
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
    }
  };

  // Limpar dados
  const clearData = async () => {
    setData({});
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      if (user?.id) {
        await clearCloudData();
      }
    } catch (error) {
      console.error('Erro ao limpar dados do onboarding:', error);
    }
  };

  // Verificar se onboarding foi completado
  const isCompleted = () => {
    return !!data.completedAt;
  };

  return {
    data,
    updateData,
    clearData,
    isCompleted,
    isLoading,
    syncStatus
  };
};
