
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { getUserRoleName } from '@/lib/supabase/types';

interface RLSSecurityEvent {
  id: string;
  event_type: string;
  table_name: string;
  user_id: string;
  policy_name: string;
  action: string;
  success: boolean;
  error_message?: string;
  metadata: any;
  created_at: string;
}

export const useAdvancedRLSMonitoring = () => {
  const { user, profile } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<RLSSecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  const isAdmin = getUserRoleName(profile) === 'admin';

  useEffect(() => {
    if (!isAdmin || !user) {
      setLoading(false);
      return;
    }

    const fetchSecurityEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('event_type', 'rls_violation')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        setSecurityEvents((data as any) || []);
      } catch (error) {
        console.error('Error fetching security events:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('security_alerts')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setAlerts((data as any) || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchSecurityEvents();
    fetchAlerts();
  }, [isAdmin, user]);

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  return {
    securityEvents,
    alerts,
    loading,
    dismissAlert,
    isAdmin
  };
};
