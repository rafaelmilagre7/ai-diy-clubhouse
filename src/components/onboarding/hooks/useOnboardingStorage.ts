
import { useState, useEffect } from 'react';
import { OnboardingData } from '../types/onboardingTypes';

const STORAGE_KEY = 'viver-ia-onboarding-data';

export const useOnboardingStorage = () => {
  const [data, setData] = useState<OnboardingData>({});

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do onboarding:', error);
    }
  }, []);

  // Atualizar dados
  const updateData = (newData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Erro ao salvar dados do onboarding:', error);
    }
  };

  // Limpar dados
  const clearData = () => {
    setData({});
    try {
      localStorage.removeItem(STORAGE_KEY);
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
    isCompleted
  };
};
