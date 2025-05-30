
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapQuickToProgress } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

interface AutoSaveConfig {
  debounceMs?: number;
  maxRetries?: number;
  enableLocalBackup?: boolean;
}

export const useIntelligentAutoSave = (
  data: QuickOnboardingData,
  currentStep: number,
  config: AutoSaveConfig = {}
) => {
  const { user } = useAuth();
  const { saveProgress } = useOnboardingProgress();
  
  const {
    debounceMs = 500,
    maxRetries = 3,
    enableLocalBackup = true
  } = config;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<string>('');

  // Backup local como fallback
  const saveToLocalStorage = useCallback((data: QuickOnboardingData, step: number) => {
    if (!enableLocalBackup || !user?.id) return;
    
    try {
      const backupData = {
        data,
        step,
        timestamp: Date.now(),
        userId: user.id
      };
      localStorage.setItem('onboarding-backup', JSON.stringify(backupData));
      console.log('📦 Backup local salvo');
    } catch (error) {
      console.error('❌ Erro ao salvar backup local:', error);
    }
  }, [enableLocalBackup, user?.id]);

  // Recuperar backup local
  const loadFromLocalStorage = useCallback((): { data: QuickOnboardingData; step: number } | null => {
    if (!enableLocalBackup || !user?.id) return null;
    
    try {
      const backup = localStorage.getItem('onboarding-backup');
      if (!backup) return null;
      
      const parsed = JSON.parse(backup);
      if (parsed.userId !== user.id) return null;
      
      // Verificar se o backup não é muito antigo (24h)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > maxAge) return null;
      
      console.log('📦 Backup local recuperado');
      return { data: parsed.data, step: parsed.step };
    } catch (error) {
      console.error('❌ Erro ao recuperar backup local:', error);
      return null;
    }
  }, [enableLocalBackup, user?.id]);

  // Salvar no servidor
  const saveToServer = useCallback(async (data: QuickOnboardingData, step: number): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const progressData = mapQuickToProgress(data);
      progressData.current_step = step.toString();
      
      const success = await saveProgress(progressData);
      
      if (success) {
        setLastSaveTime(Date.now());
        setHasUnsavedChanges(false);
        retryCountRef.current = 0;
        console.log('✅ Auto-save realizado com sucesso');
        return true;
      } else {
        throw new Error('Falha ao salvar no servidor');
      }
    } catch (error) {
      console.error('❌ Erro no auto-save:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro desconhecido');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, saveProgress]);

  // Auto-save com retry
  const performAutoSave = useCallback(async (data: QuickOnboardingData, step: number) => {
    // Salvar backup local primeiro
    saveToLocalStorage(data, step);
    
    // Tentar salvar no servidor
    const success = await saveToServer(data, step);
    
    if (!success && retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`🔄 Tentativa ${retryCountRef.current} de ${maxRetries} para auto-save`);
      
      // Retry com backoff exponencial
      const delay = Math.pow(2, retryCountRef.current) * 1000;
      setTimeout(() => performAutoSave(data, step), delay);
    } else if (!success) {
      toast.error('Erro ao salvar automaticamente. Dados salvos localmente como backup.');
    }
  }, [saveToLocalStorage, saveToServer, maxRetries]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((data: QuickOnboardingData, step: number) => {
    // Verificar se os dados mudaram
    const dataStr = JSON.stringify({ data, step });
    if (dataStr === lastDataRef.current) return;
    
    lastDataRef.current = dataStr;
    setHasUnsavedChanges(true);
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Agendar novo save
    timeoutRef.current = setTimeout(() => {
      performAutoSave(data, step);
    }, debounceMs);
  }, [debounceMs, performAutoSave]);

  // Efeito para auto-save quando dados mudam
  useEffect(() => {
    if (!user?.id) return;
    
    // Só fazer auto-save se tem dados mínimos
    if (data.name || data.email || data.company_name) {
      debouncedAutoSave(data, currentStep);
    }
  }, [data, currentStep, user?.id, debouncedAutoSave]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Salvar imediatamente (para navegação entre steps)
  const saveImmediately = useCallback(async (): Promise<boolean> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    return await saveToServer(data, currentStep);
  }, [data, currentStep, saveToServer]);

  return {
    isSaving,
    lastSaveTime,
    hasUnsavedChanges,
    saveError,
    saveImmediately,
    loadFromLocalStorage,
    // Estatísticas para debugging
    retryCount: retryCountRef.current
  };
};
