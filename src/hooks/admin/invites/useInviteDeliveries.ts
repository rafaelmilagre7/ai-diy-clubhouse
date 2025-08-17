import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DeliveryEvent {
  id: string;
  invite_id: string;
  channel: 'email' | 'whatsapp';
  status: string;
  provider_id?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failed_at?: string;
  metadata?: {
    open_count?: number;
    click_count?: number;
    bounce_type?: string;
    bounce_message?: string;
    whatsapp_status?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export function useInviteDeliveries(inviteId?: string) {
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeliveries = async () => {
    if (!inviteId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('invite_deliveries')
        .select('*')
        .eq('invite_id', inviteId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDeliveries(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar deliveries:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o melhor status de um convite baseado nos deliveries
  const getBestStatus = (inviteDeliveries: DeliveryEvent[]) => {
    if (!inviteDeliveries || inviteDeliveries.length === 0) {
      return { status: 'pending', channel: 'email' as const, metadata: {} };
    }

    // Prioridade: clicked > opened > delivered > sent > failed > pending
    const priorityOrder = ['clicked', 'opened', 'delivered', 'sent', 'failed', 'pending'];
    
    let bestDelivery: DeliveryEvent | null = null;
    let bestPriority = priorityOrder.length;

    for (const delivery of inviteDeliveries) {
      const priority = priorityOrder.indexOf(delivery.status);
      if (priority !== -1 && priority < bestPriority) {
        bestPriority = priority;
        bestDelivery = delivery;
      }
    }

    if (!bestDelivery) {
      return { status: 'pending', channel: 'email' as const, metadata: {} };
    }

    return {
      status: bestDelivery.status,
      channel: bestDelivery.channel,
      metadata: bestDelivery.metadata || {}
    };
  };

  // Função para obter resumo de métricas
  const getDeliveryMetrics = (inviteDeliveries: DeliveryEvent[]) => {
    const metrics = {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalFailed: 0,
      openRate: 0,
      clickRate: 0,
      deliveryRate: 0
    };

    if (!inviteDeliveries || inviteDeliveries.length === 0) {
      return metrics;
    }

    const emailDeliveries = inviteDeliveries.filter(d => d.channel === 'email');
    const whatsappDeliveries = inviteDeliveries.filter(d => d.channel === 'whatsapp');
    
    // Contar eventos únicos por canal
    const hasEmailSent = emailDeliveries.some(d => ['sent', 'delivered', 'opened', 'clicked'].includes(d.status));
    const hasWhatsAppSent = whatsappDeliveries.some(d => ['sent', 'delivered'].includes(d.status));
    const hasEmailDelivered = emailDeliveries.some(d => ['delivered', 'opened', 'clicked'].includes(d.status));
    const hasWhatsAppDelivered = whatsappDeliveries.some(d => d.status === 'delivered');
    const hasOpened = emailDeliveries.some(d => ['opened', 'clicked'].includes(d.status));
    const hasClicked = emailDeliveries.some(d => d.status === 'clicked');
    const hasFailed = inviteDeliveries.some(d => ['failed', 'bounced', 'complained'].includes(d.status));

    metrics.totalSent = (hasEmailSent ? 1 : 0) + (hasWhatsAppSent ? 1 : 0);
    metrics.totalDelivered = (hasEmailDelivered ? 1 : 0) + (hasWhatsAppDelivered ? 1 : 0);
    metrics.totalOpened = hasOpened ? 1 : 0;
    metrics.totalClicked = hasClicked ? 1 : 0;
    metrics.totalFailed = hasFailed ? 1 : 0;

    // Calcular taxas
    if (metrics.totalSent > 0) {
      metrics.deliveryRate = (metrics.totalDelivered / metrics.totalSent) * 100;
    }
    
    if (metrics.totalDelivered > 0) {
      metrics.openRate = (metrics.totalOpened / metrics.totalDelivered) * 100;
    }
    
    if (metrics.totalOpened > 0) {
      metrics.clickRate = (metrics.totalClicked / metrics.totalOpened) * 100;
    }

    return metrics;
  };

  useEffect(() => {
    fetchDeliveries();
  }, [inviteId]);

  return {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    getBestStatus,
    getDeliveryMetrics
  };
}