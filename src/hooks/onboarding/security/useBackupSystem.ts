
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useBackupSystem = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const createBackup = useCallback(async (userId: string, backupType: string = 'manual'): Promise<string | null> => {
    setIsCreatingBackup(true);
    
    try {
      console.log('💾 Criando backup para usuário:', userId);

      const { data, error } = await supabase.rpc('create_onboarding_backup', {
        p_user_id: userId,
        p_backup_type: backupType
      });

      if (error) {
        console.error('❌ Erro ao criar backup:', error);
        return null;
      }

      const backupId = data as string;
      console.log('✅ Backup criado com sucesso:', backupId);
      
      return backupId;
    } catch (error: any) {
      console.error('❌ Exceção ao criar backup:', error);
      return null;
    } finally {
      setIsCreatingBackup(false);
    }
  }, []);

  const getBackups = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('onboarding_backups')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao buscar backups:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('❌ Exceção ao buscar backups:', error);
      return [];
    }
  }, []);

  return {
    createBackup,
    getBackups,
    isCreatingBackup
  };
};
