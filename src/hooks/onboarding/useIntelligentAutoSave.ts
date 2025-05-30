
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapQuickToProgress, validateStepData } from '@/utils/onboarding/dataMappers';
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
    debounceMs = 3000, // Aumentado para 3 segundos
    maxRetries = 2, // Reduzido tentativas
    enableLocalBackup = true
  } = config;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<string>('');

  // Verificar se os dados são válidos para salvar
  const isDataValid = useCallback((data: QuickOnboardingData): boolean => {
    // Só salvar se tem dados mínimos
    const hasMinimalData = data.name && data.name.trim().length > 0;
    
    if (!hasMinimalData) {
      console.log('📝 Dados insuficientes para auto-save:', { name: data.name });
      return false;
    }
    
    return true;
  }, []);

  // Backup local como fallback
  const saveToLocalStorage = useCallback((data: QuickOnboardingData, step: number) => {
    if (!enableLocalBackup || !user?.id || !isDataValid(data)) return;
    
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
  }, [enableLocalBackup, user?.id, isDataValid]);

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

  // Salvar no servidor com validação mais rigorosa
  const saveToServer = useCallback(async (data: QuickOnboardingData, step: number): Promise<boolean> => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado');
      return false;
    }
    
    if (!isDataValid(data)) {
      console.log('❌ Dados inválidos para salvar');
      return false;
    }
    
    try {
      console.log('💾 Iniciando auto-save no servidor...', { step, dataKeys: Object.keys(data) });
      setIsSaving(true);
      setSaveError(null);
      
      const progressData = mapQuickToProgress(data);
      progressData.current_step = step.toString();
      
      console.log('📊 Dados mapeados para envio:', progressData);
      
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro no auto-save:', error);
      setSaveError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, saveProgress, isDataValid]);

  // Auto-save com retry limitado
  const performAutoSave = useCallback(async (data: QuickOnboardingData, step: number) => {
    // Salvar backup local primeiro (sempre)
    saveToLocalStorage(data, step);
    
    // Só tentar salvar no servidor se os dados são válidos
    if (!isDataValid(data)) {
      console.log('⏭️ Pulando auto-save no servidor - dados insuficientes');
      return;
    }
    
    // Tentar salvar no servidor
    const success = await saveToServer(data, step);
    
    if (!success && retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`🔄 Tentativa ${retryCountRef.current} de ${maxRetries} para auto-save`);
      
      // Retry com backoff exponencial
      const delay = Math.pow(2, retryCountRef.current) * 2000; // 2s, 4s, 8s
      setTimeout(() => performAutoSave(data, step), delay);
    } else if (!success) {
      console.log('❌ Auto-save falhou após todas as tentativas');
      // Não mostrar toast de erro para não incomodar o usuário
    }
  }, [saveToLocalStorage, saveToServer, maxRetries, isDataValid]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((data: QuickOnboardingData, step: number) => {
    // Verificar se os dados mudaram significativamente
    const dataStr = JSON.stringify({ 
      name: data.name, 
      email: data.email, 
      step 
    });
    
    if (dataStr === lastDataRef.current) {
      console.log('📝 Dados não mudaram, pulando auto-save');
      return;
    }
    
    lastDataRef.current = dataStr;
    setHasUnsavedChanges(true);
    
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Agendar novo save apenas se há dados válidos
    if (isDataValid(data)) {
      console.log('⏰ Agendando auto-save em', debounceMs + 'ms');
      timeoutRef.current = setTimeout(() => {
        performAutoSave(data, step);
      }, debounceMs);
    }
  }, [debounceMs, performAutoSave, isDataValid]);

  // Efeito para auto-save quando dados mudam
  useEffect(() => {
    if (!user?.id) return;
    
    debouncedAutoSave(data, currentStep);
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
    
    // Só salvar se os dados são válidos
    if (!isDataValid(data)) {
      console.log('⚠️ Não é possível salvar - dados insuficientes');
      return false;
    }
    
    return await saveToServer(data, currentStep);
  }, [data, currentStep, saveToServer, isDataValid]);

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
