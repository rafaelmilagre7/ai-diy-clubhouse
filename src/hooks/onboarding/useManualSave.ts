
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { useOnboardingProgress } from './useOnboardingProgress';
import { mapQuickToProgress } from '@/utils/onboarding/dataMappers';
import { toast } from 'sonner';

interface ManualSaveConfig {
  enableLocalBackup?: boolean;
}

export const useManualSave = (config: ManualSaveConfig = {}) => {
  const { user } = useAuth();
  const { saveProgress } = useOnboardingProgress();
  
  const { enableLocalBackup = true } = config;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Backup local
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

  // Limpar backup após save bem-sucedido
  const clearLocalBackup = useCallback(() => {
    if (!enableLocalBackup) return;
    
    try {
      localStorage.removeItem('onboarding-backup');
      console.log('🧹 Backup local limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar backup local:', error);
    }
  }, [enableLocalBackup]);

  // Salvar manualmente (apenas quando solicitado)
  const saveManually = useCallback(async (data: QuickOnboardingData, step: number): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    // Validação básica - apenas campos essenciais
    if (!data.name || data.name.trim().length === 0) {
      toast.error('Nome é obrigatório');
      return false;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      
      console.log('💾 Salvando progresso manualmente...', { step, dataKeys: Object.keys(data) });
      
      // Salvar backup local primeiro
      saveToLocalStorage(data, step);
      
      const progressData = mapQuickToProgress(data);
      progressData.current_step = step.toString();
      
      console.log('📊 Dados mapeados para envio:', progressData);
      
      const success = await saveProgress(progressData);
      
      if (success) {
        setLastSaveTime(Date.now());
        clearLocalBackup(); // Limpar backup após sucesso
        console.log('✅ Progresso salvo com sucesso');
        toast.success('Progresso salvo!');
        return true;
      } else {
        throw new Error('Falha ao salvar no servidor');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao salvar:', error);
      setSaveError(errorMessage);
      toast.error('Erro ao salvar progresso');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, saveProgress, saveToLocalStorage, clearLocalBackup]);

  return {
    isSaving,
    lastSaveTime,
    saveError,
    saveManually,
    loadFromLocalStorage,
    // Funções para backup manual se necessário
    saveToLocalStorage,
    clearLocalBackup
  };
};
