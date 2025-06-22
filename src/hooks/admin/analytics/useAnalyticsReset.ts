
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
      
      console.log('📊 [ANALYTICS RESET] Iniciando reset das estatísticas');
      
      const resetTimestamp = new Date().toISOString();
      const tablesAffected = ['analytics', 'audit_logs', 'invite_analytics_events'];
      let totalBackupRecords = 0;
      let totalDeletedRecords = 0;

      // 1. Fazer backup dos dados antes de excluir
      for (const tableName of tablesAffected) {
        try {
          // Contar registros para backup
          const { count: recordCount } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (recordCount && recordCount > 0) {
            // Fazer backup dos dados
            const { data: tableData, error: fetchError } = await supabase
              .from(tableName)
              .select('*');

            if (fetchError) {
              console.warn(`⚠️ Erro ao buscar dados de ${tableName}:`, fetchError);
              continue;
            }

            // Inserir backup
            if (tableData && tableData.length > 0) {
              const { error: backupError } = await supabase
                .from('analytics_backups')
                .insert({
                  table_name: tableName,
                  backup_data: tableData,
                  backup_reason: 'admin_reset',
                  record_count: tableData.length,
                  created_at: resetTimestamp
                });

              if (backupError) {
                console.warn(`⚠️ Erro ao fazer backup de ${tableName}:`, backupError);
              } else {
                totalBackupRecords += tableData.length;
                console.log(`✅ Backup de ${tableName}: ${tableData.length} registros`);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao processar ${tableName}:`, error);
        }
      }

      // 2. Excluir dados das tabelas (exceto dados críticos do sistema)
      for (const tableName of tablesAffected) {
        try {
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Preservar registros do sistema

          if (deleteError) {
            console.warn(`⚠️ Erro ao limpar ${tableName}:`, deleteError);
          } else {
            console.log(`✅ Tabela ${tableName} limpa`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao limpar ${tableName}:`, error);
        }
      }

      // 3. Registrar a operação de reset
      await supabase
        .from('audit_logs')
        .insert({
          event_type: 'admin_action',
          action: 'analytics_reset',
          details: {
            backup_records: totalBackupRecords,
            tables_affected: tablesAffected,
            reset_timestamp: resetTimestamp
          }
        });

      const result: AnalyticsResetStats = {
        backupRecords: totalBackupRecords,
        deletedRecords: totalDeletedRecords,
        tablesAffected,
        resetTimestamp
      };

      setResetStats(result);
      console.log('✅ Reset de analytics concluído:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Erro no reset de analytics:', error);
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
