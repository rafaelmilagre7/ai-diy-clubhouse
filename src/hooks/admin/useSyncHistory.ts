import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SyncHistoryLog {
  id: string;
  synced_at: string;
  master_email: string;
  member_email: string | null;
  operation: string;
  sync_status: 'success' | 'error' | 'warning';
  error_message: string | null;
  status?: 'success' | 'error' | 'warning'; // Para compatibilidade com componentes
}

export interface AggregatedSync {
  synced_at: string;
  total_logs: number;
  success_count: number;
  error_count: number;
  warning_count: number;
  masters_processed: Set<string>;
  members_processed: Set<string>;
  logs: SyncHistoryLog[];
}

export const useSyncHistory = () => {
  const { data: rawLogs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sync-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_member_sync_log')
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      
      // Mapear sync_status para status para compatibilidade com componentes
      return (data || []).map(log => ({
        ...log,
        status: log.sync_status
      })) as SyncHistoryLog[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false
  });

  // Agregar logs por synced_at (cada sincronização)
  const aggregatedSyncs: AggregatedSync[] = rawLogs.reduce((acc, log) => {
    const existingSync = acc.find(s => s.synced_at === log.synced_at);
    
    if (existingSync) {
      existingSync.logs.push(log);
      existingSync.total_logs++;
      if (log.sync_status === 'success') existingSync.success_count++;
      if (log.sync_status === 'error') existingSync.error_count++;
      if (log.sync_status === 'warning') existingSync.warning_count++;
      existingSync.masters_processed.add(log.master_email);
      if (log.member_email) existingSync.members_processed.add(log.member_email);
    } else {
      acc.push({
        synced_at: log.synced_at,
        total_logs: 1,
        success_count: log.sync_status === 'success' ? 1 : 0,
        error_count: log.sync_status === 'error' ? 1 : 0,
        warning_count: log.sync_status === 'warning' ? 1 : 0,
        masters_processed: new Set([log.master_email]),
        members_processed: log.member_email ? new Set([log.member_email]) : new Set(),
        logs: [log]
      });
    }
    
    return acc;
  }, [] as AggregatedSync[]);

  // Estatísticas gerais
  const stats = {
    total_syncs: aggregatedSyncs.length,
    total_logs: rawLogs.length,
    success_rate: rawLogs.length > 0 
      ? Math.round((rawLogs.filter(l => l.sync_status === 'success').length / rawLogs.length) * 100)
      : 0,
    last_sync: aggregatedSyncs[0]?.synced_at || null
  };

  return {
    aggregatedSyncs,
    rawLogs,
    stats,
    isLoading,
    error,
    refetch
  };
};
