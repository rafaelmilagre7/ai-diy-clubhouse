import { useState, useEffect } from 'react';
import { OnboardingData } from '../types/onboardingTypes';
import { useCloudSync } from './useCloudSync';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'viver-ia-onboarding-data';

export const useOnboardingStorage = () => {
  const { user } = useAuth();
  const { saveToCloud, loadFromCloud, clearCloudData, syncStatus } = useCloudSync();
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Função para salvar dados no localStorage e tentar sync na nuvem
  const saveDataToStorage = async (dataToSave: OnboardingData) => {
    try {
      // Sempre salvar no localStorage primeiro (prioridade)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('[OnboardingStorage] Dados salvos no localStorage');
      
      // Se há foto de perfil, atualizar avatar do usuário
      if (dataToSave.profilePicture && user?.id) {
        try {
          await supabase
            .from('profiles')
            .update({ avatar_url: dataToSave.profilePicture })
            .eq('id', user.id);
          console.log('[OnboardingStorage] Avatar atualizado no perfil');
        } catch (avatarError) {
          console.warn('[OnboardingStorage] Falha ao atualizar avatar (não crítico):', avatarError);
        }
      }
      
      // Tentar sincronizar na nuvem (não crítico se falhar)
      if (user?.id) {
        try {
          await saveToCloud(dataToSave);
          console.log('[OnboardingStorage] Dados sincronizados na nuvem');
        } catch (cloudError) {
          console.warn('[OnboardingStorage] Falha na sincronização (não crítico):', cloudError);
          // Não falhar se a nuvem não funcionar - localStorage é suficiente
        }
      }
    } catch (error) {
      console.error('[OnboardingStorage] Erro ao salvar dados:', error);
      throw error;
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // SEMPRE priorizar localStorage primeiro
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          try {
            const parsedLocalData = JSON.parse(localData);
            setData(parsedLocalData);
            console.log('[OnboardingStorage] Dados recuperados do localStorage');
            
            // Se há dados locais, usar eles imediatamente
            // Tentar sync na nuvem em background (não crítico)
            if (user?.id) {
              try {
                const cloudData = await loadFromCloud();
                // Só usar dados da nuvem se foram atualizados mais recentemente
                if (cloudData && cloudData.updatedAt && parsedLocalData.updatedAt) {
                  const cloudTime = new Date(cloudData.updatedAt).getTime();
                  const localTime = new Date(parsedLocalData.updatedAt).getTime();
                  
                  if (cloudTime > localTime) {
                    setData(cloudData);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
                    console.log('[OnboardingStorage] Dados da nuvem mais recentes aplicados');
                  }
                }
              } catch (cloudError) {
                console.warn('[OnboardingStorage] Falha ao carregar da nuvem (usando localStorage):', cloudError);
                // Continuar com dados locais se nuvem falhar
              }
            }
            
            return; // Dados encontrados localmente
          } catch (parseError) {
            console.error('[OnboardingStorage] Erro ao parsear dados locais:', parseError);
            localStorage.removeItem(STORAGE_KEY); // Limpar dados corrompidos
          }
        }

        // Se não há dados locais, tentar carregar da nuvem
        if (user?.id) {
          try {
            const cloudData = await loadFromCloud();
            if (cloudData) {
              setData(cloudData);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
              console.log('[OnboardingStorage] Dados carregados da nuvem');
              return;
            }
          } catch (cloudError) {
            console.warn('[OnboardingStorage] Erro ao carregar da nuvem:', cloudError);
          }
        }
        
        // Se chegou aqui, não há dados salvos
        console.log('[OnboardingStorage] Nenhum dado encontrado - iniciando onboarding novo');
        
      } catch (error) {
        console.error('[OnboardingStorage] Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user?.id, loadFromCloud, saveToCloud]);

  // Atualizar dados (sem auto-save, apenas atualiza estado local)
  const updateData = (newData: Partial<OnboardingData>) => {
    const updatedData = { 
      ...data, 
      ...newData, 
      updatedAt: new Date().toISOString() 
    };
    setData(updatedData);
    setHasUnsavedChanges(true);
    
    // Log para debugging
    console.log('[OnboardingStorage] Dados atualizados (pendente salvamento):', Object.keys(newData));
  };

  // Salvamento manual forçado (usado nas mudanças de etapas)
  const forceSave = async () => {
    try {
      await saveDataToStorage(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('[OnboardingStorage] Salvamento manual concluído');
    } catch (error) {
      console.error('[OnboardingStorage] Erro no salvamento manual:', error);
      throw error;
    }
  };

  // Limpar dados
  const clearData = async () => {
    setData({});
    setHasUnsavedChanges(false);
    setLastSaved(null);
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      
      if (user?.id) {
        await clearCloudData();
      }
      console.log('[OnboardingStorage] Dados limpos');
    } catch (error) {
      console.error('[OnboardingStorage] Erro ao limpar dados:', error);
    }
  };

  // Verificar se onboarding foi completado
  const isCompleted = () => {
    return !!data.completedAt;
  };

  // Recuperar dados perdidos (função de emergência)
  const recoverData = () => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsedData = JSON.parse(localData);
        setData(parsedData);
        setHasUnsavedChanges(false); // Dados recuperados estão salvos
        console.log('[OnboardingStorage] Dados recuperados do localStorage');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[OnboardingStorage] Erro ao recuperar dados:', error);
      return false;
    }
  };

  return {
    data,
    updateData,
    forceSave,
    clearData,
    recoverData,
    isCompleted,
    isLoading,
    syncStatus,
    hasUnsavedChanges,
    lastSaved
  };
};
