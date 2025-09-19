import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseAutomationLogsParams {
  status?: string;
  ruleId?: string;
  search?: string;
  limit?: number;
}

export const useAutomationLogs = (params: UseAutomationLogsParams = {}) => {
  const { status, ruleId, search, limit = 100 } = params;

  return useQuery({
    queryKey: ['automation_logs', status, ruleId, search, limit],
    queryFn: async () => {
      let query = supabase
        .from('automation_logs')
        .select(`
          *,
          automation_rules:rule_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      if (ruleId) {
        query = query.eq('rule_id', ruleId);
      }

      if (search) {
        query = query.or(`automation_rules.name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useAutomationLogStats = () => {
  return useQuery({
    queryKey: ['automation_log_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_logs')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error) throw error;

      const stats = {
        total: data.length,
        success: data.filter(log => log.status === 'success').length,
        failed: data.filter(log => log.status === 'failed').length,
        partial: data.filter(log => log.status === 'partial').length,
        pending: data.filter(log => log.status === 'pending').length,
      };

      return stats;
    },
  });
};