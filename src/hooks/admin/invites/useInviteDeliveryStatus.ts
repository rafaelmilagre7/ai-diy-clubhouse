import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DeliveryEvent {
  id: string;
  invite_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'failed' | 'delivery_delayed';
  email_id?: string;
  channel: string;
  created_at: string;
  event_data?: any;
}

export interface DeliveryStatus {
  hasEvents: boolean;
  bestStatus: 'clicked' | 'opened' | 'delivered' | 'sent' | 'failed' | 'bounced' | 'complained' | 'delivery_delayed' | null;
  events: DeliveryEvent[];
  lastEventAt?: string;
}

const statusPriority = {
  'clicked': 6,
  'opened': 5,
  'delivered': 4,
  'sent': 3,
  'delivery_delayed': 2,
  'complained': 1,
  'bounced': 1,
  'failed': 1,
};

export function useInviteDeliveryStatus(inviteId?: string) {
  const [status, setStatus] = useState<DeliveryStatus>({
    hasEvents: false,
    bestStatus: null,
    events: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteId) return;

    const fetchDeliveryStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invite_delivery_events')
          .select('*')
          .eq('invite_id', inviteId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          setStatus({
            hasEvents: false,
            bestStatus: null,
            events: [],
          });
          return;
        }

        // Determinar o melhor status baseado na prioridade
        let bestStatus = data[0].event_type;
        let bestPriority = statusPriority[bestStatus as keyof typeof statusPriority] || 0;

        for (const event of data) {
          const priority = statusPriority[event.event_type as keyof typeof statusPriority] || 0;
          if (priority > bestPriority) {
            bestStatus = event.event_type;
            bestPriority = priority;
          }
        }

        setStatus({
          hasEvents: true,
          bestStatus: bestStatus as any,
          events: data,
          lastEventAt: data[0].created_at,
        });
      } catch (error) {
        console.error('Erro ao buscar status de delivery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryStatus();

    // Subscrever a mudanças em tempo real
    const subscription = supabase
      .channel(`delivery_events_${inviteId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invite_delivery_events',
          filter: `invite_id=eq.${inviteId}`,
        },
        () => {
          fetchDeliveryStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [inviteId]);

  return { status, loading };
}
