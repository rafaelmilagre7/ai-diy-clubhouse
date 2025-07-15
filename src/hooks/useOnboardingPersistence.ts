import { useCallback, useEffect, useRef } from 'react';
import { OnboardingFinalData } from './useCleanOnboarding';

const STORAGE_KEY = 'onboarding_auto_save';
const SESSION_KEY = 'onboarding_session_backup';
const AUTOSAVE_DELAY = 1000; // 1 segundo de debounce

interface StorageData {
  data: OnboardingFinalData;
  timestamp: number;
  step: number;
  userId: string;
}

export const useOnboardingPersistence = (userId: string | undefined) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  // Salvar dados no localStorage com debounce
  const saveToLocal = useCallback((data: OnboardingFinalData) => {
    if (!userId || !data) return;

    // Cancelar timer anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce para evitar salvamentos excessivos
    debounceRef.current = setTimeout(() => {
      try {
        const storageData: StorageData = {
          data,
          timestamp: Date.now(),
          step: data.current_step,
          userId
        };

        const serialized = JSON.stringify(storageData);
        
        // Evitar salvamentos desnecessários
        if (serialized === lastSavedRef.current) return;
        
        localStorage.setItem(STORAGE_KEY, serialized);
        sessionStorage.setItem(SESSION_KEY, serialized);
        lastSavedRef.current = serialized;
        
        console.log('💾 [PERSISTENCE] Dados salvos localmente:', {
          step: data.current_step,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.error('❌ [PERSISTENCE] Erro ao salvar:', error);
      }
    }, AUTOSAVE_DELAY);
  }, [userId]);

  // Recuperar dados do localStorage
  const loadFromLocal = useCallback((): OnboardingFinalData | null => {
    if (!userId) return null;

    try {
      // Tentar localStorage primeiro
      let stored = localStorage.getItem(STORAGE_KEY);
      
      // Fallback para sessionStorage
      if (!stored) {
        stored = sessionStorage.getItem(SESSION_KEY);
      }

      if (!stored) return null;

      const storageData: StorageData = JSON.parse(stored);
      
      // Verificar se é do mesmo usuário
      if (storageData.userId !== userId) {
        console.log('🔄 [PERSISTENCE] Dados de outro usuário, limpando...');
        clearLocal();
        return null;
      }

      // Verificar se não é muito antigo (24 horas)
      const ageHours = (Date.now() - storageData.timestamp) / (1000 * 60 * 60);
      if (ageHours > 24) {
        console.log('🕒 [PERSISTENCE] Dados muito antigos, limpando...');
        clearLocal();
        return null;
      }

      console.log('📥 [PERSISTENCE] Dados recuperados:', {
        step: storageData.step,
        age: `${Math.round(ageHours * 60)} min`,
        timestamp: new Date(storageData.timestamp).toLocaleTimeString()
      });

      return storageData.data;
    } catch (error) {
      console.error('❌ [PERSISTENCE] Erro ao recuperar:', error);
      clearLocal();
      return null;
    }
  }, [userId]);

  // Limpar dados locais
  const clearLocal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      lastSavedRef.current = '';
      console.log('🗑️ [PERSISTENCE] Dados locais limpos');
    } catch (error) {
      console.error('❌ [PERSISTENCE] Erro ao limpar:', error);
    }
  }, []);

  // Verificar se há dados mais recentes localmente
  const hasNewerLocalData = useCallback((serverData: OnboardingFinalData): boolean => {
    if (!userId) return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const storageData: StorageData = JSON.parse(stored);
      
      if (storageData.userId !== userId) return false;

      // Comparar timestamps
      const serverTimestamp = serverData.updated_at ? new Date(serverData.updated_at).getTime() : 0;
      const localTimestamp = storageData.timestamp;

      // Se dados locais são mais recentes por mais de 5 segundos
      const isNewer = localTimestamp > serverTimestamp + 5000;
      
      if (isNewer) {
        console.log('⚡ [PERSISTENCE] Dados locais mais recentes detectados');
      }
      
      return isNewer;
    } catch (error) {
      console.error('❌ [PERSISTENCE] Erro ao comparar:', error);
      return false;
    }
  }, [userId]);

  // Salvar automaticamente ao detectar mudanças de visibilidade
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Força salvamento imediato quando aba fica oculta
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        console.log('👁️ [PERSISTENCE] Salvamento forçado - aba oculta');
      }
    };

    const handleBeforeUnload = () => {
      // Força salvamento antes de fechar
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      console.log('🚪 [PERSISTENCE] Salvamento forçado - fechando página');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    saveToLocal,
    loadFromLocal,
    clearLocal,
    hasNewerLocalData
  };
};