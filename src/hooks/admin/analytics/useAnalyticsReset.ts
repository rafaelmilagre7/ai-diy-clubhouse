
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AnalyticsResetStats {
  backupRecords: number;
  deletedRecords: number;
  tablesAffected: string[];
  resetTimestamp: string;
}

export const useAnalyticsReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStats, setResetStats] = useState<AnalyticsResetStats | null>(null);

  const resetAnalyticsData = useCallback(async (): Promise<AnalyticsResetStats> => {
    try {
      setIsResetting(true);
      
      console.log('📊 [ANALYTICS RESET] Iniciando reset com backup automático');
      
      // Usar a nova função SQL aprimorada
      const { data, error } = await supabase.rpc('reset_analytics_data_enhanced');

      if (error) {
        console.error('❌ Erro no reset de analytics:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Resposta vazia da função de reset');
      }

      console.log('📋 Resultado do reset:', data);

      if (!data.success) {
        throw new Error(data.message || 'Erro no reset de analytics');
      }

      const result: AnalyticsResetStats = {
        backupRecords: data.backupRecords || 0,
        deletedRecords: data.deletedRecords || 0,
        tablesAffected: data.tablesAffected || [],
        resetTimestamp: data.resetTimestamp || new Date().toISOString()
      };

      setResetStats(result);
      
      // Toast de sucesso
      toast.success('✅ Reset de analytics concluído!', {
        description: `${result.backupRecords} registros em backup, ${result.tablesAffected.length} tabelas afetadas`,
        duration: 8000
      });

      console.log('✅ Reset de analytics concluído:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro no reset de analytics:', error);
      
      toast.error('❌ Erro no reset de analytics', {
        description: error.message || 'Erro desconhecido',
        duration: 8000
      });
      
      throw error;
    } finally {
      setIsResetting(false);
    }
  }, []);

  const clearResetStats = useCallback(() => {
    setResetStats(null);
  }, []);

  return {
    resetAnalyticsData,
    isResetting,
    resetStats,
    clearResetStats
  };
};
