import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface SecurityMetrics {
  totalViolations: number;
  criticalViolations: number;
  recentViolations: number;
  topViolationTypes: Array<{
    type: string;
    count: number;
  }>;
  periodDays: number;
  generatedAt: string;
}

interface SecurityViolation {
  id: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  resourceAccessed?: string;
  createdAt: string;
  resolved: boolean;
}

export const useSecurityMetrics = (days: number = 7) => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get security metrics
      const { data: metricsData, error: metricsError } = await supabase.rpc('get_security_metrics', {
        p_user_id: isAdmin ? null : user.id,
        p_days: days
      });

      if (metricsError) throw metricsError;

      setMetrics({
        totalViolations: metricsData.total_violations,
        criticalViolations: metricsData.critical_violations,
        recentViolations: metricsData.recent_violations,
        topViolationTypes: metricsData.top_violation_types || [],
        periodDays: metricsData.period_days,
        generatedAt: metricsData.generated_at
      });

      // Get recent violations
      let violationsQuery = supabase
        .from('security_violations')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (!isAdmin) {
        violationsQuery = violationsQuery.eq('user_id', user.id);
      }

      const { data: violationsData, error: violationsError } = await violationsQuery;

      if (violationsError) throw violationsError;

      setViolations((violationsData || []).map(v => ({
        id: v.id,
        violationType: v.violation_type,
        severity: v.severity,
        description: v.description,
        ipAddress: v.ip_address,
        userAgent: v.user_agent,
        resourceAccessed: v.resource_accessed,
        createdAt: v.created_at,
        resolved: v.resolved
      })));

    } catch (err) {
      console.error('Failed to fetch security metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, days]);

  const resolveViolation = useCallback(async (violationId: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('security_violations')
        .update({
          resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', violationId);

      if (error) throw error;

      // Refresh data
      await fetchMetrics();
    } catch (err) {
      console.error('Failed to resolve violation:', err);
      throw err;
    }
  }, [isAdmin, user?.id, fetchMetrics]);

  const logSecurityViolation = useCallback(async (
    violationType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    additionalData: Record<string, any> = {}
  ) => {
    try {
      await supabase.rpc('log_security_violation', {
        p_user_id: user?.id,
        p_violation_type: violationType,
        p_severity: severity,
        p_description: description,
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent,
        p_resource_accessed: window.location.pathname,
        p_additional_data: additionalData,
        p_auto_block: severity === 'critical'
      });

      // Refresh metrics if this is a significant violation
      if (severity === 'high' || severity === 'critical') {
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Failed to log security violation:', error);
    }
  }, [user?.id, fetchMetrics]);

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [fetchMetrics]);

  // Auto-refresh every 30 seconds for real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && document.visibilityState === 'visible') {
        fetchMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMetrics, user]);

  return {
    metrics,
    violations,
    loading,
    error,
    fetchMetrics,
    resolveViolation,
    logSecurityViolation,
    isAdmin
  };
};

// Get client IP address (helper function)
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}