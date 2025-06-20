
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InviteAnalytics {
  totalInvites: number;
  sentByChannel: {
    email: number;
    whatsapp: number;
    both: number;
  };
  deliveryStats: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  channelPerformance: {
    email: {
      sentRate: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
    };
    whatsapp: {
      sentRate: number;
      deliveryRate: number;
      openRate: number;
      clickRate: number;
    };
  };
  recentActivity: Array<{
    id: string;
    invite_id: string;
    channel: string;
    status: string;
    created_at: string;
    email?: string;
  }>;
}

export const useInviteAnalytics = (timeRange: string = '30d') => {
  const [analytics, setAnalytics] = useState<InviteAnalytics>({
    totalInvites: 0,
    sentByChannel: { email: 0, whatsapp: 0, both: 0 },
    deliveryStats: { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    channelPerformance: {
      email: { sentRate: 0, deliveryRate: 0, openRate: 0, clickRate: 0 },
      whatsapp: { sentRate: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calcular data de início
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Buscar convites
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('id, email, preferred_channel, created_at')
        .gte('created_at', startDate.toISOString());

      if (invitesError) throw invitesError;

      // Buscar entregas
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('invite_deliveries')
        .select(`
          id,
          invite_id,
          channel,
          status,
          created_at,
          invites!inner(email)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (deliveriesError) throw deliveriesError;

      // Processar dados
      const totalInvites = invites?.length || 0;
      
      // Contar por canal
      const sentByChannel = (invites || []).reduce((acc, invite) => {
        const channel = invite.preferred_channel || 'email';
        if (channel === 'both') acc.both++;
        else if (channel === 'whatsapp') acc.whatsapp++;
        else acc.email++;
        return acc;
      }, { email: 0, whatsapp: 0, both: 0 });

      // Estatísticas de entrega
      const deliveryStats = (deliveries || []).reduce((acc, delivery) => {
        acc.total++;
        if (delivery.status === 'sent') acc.sent++;
        else if (delivery.status === 'delivered') acc.delivered++;
        else if (delivery.status === 'opened') acc.opened++;
        else if (delivery.status === 'clicked') acc.clicked++;
        else if (delivery.status === 'failed') acc.failed++;
        return acc;
      }, { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 });

      // Performance por canal
      const emailDeliveries = (deliveries || []).filter(d => d.channel === 'email');
      const whatsappDeliveries = (deliveries || []).filter(d => d.channel === 'whatsapp');

      const calculatePerformance = (channelDeliveries: any[]) => {
        const total = channelDeliveries.length;
        if (total === 0) return { sentRate: 0, deliveryRate: 0, openRate: 0, clickRate: 0 };

        const sent = channelDeliveries.filter(d => ['sent', 'delivered', 'opened', 'clicked'].includes(d.status)).length;
        const delivered = channelDeliveries.filter(d => ['delivered', 'opened', 'clicked'].includes(d.status)).length;
        const opened = channelDeliveries.filter(d => ['opened', 'clicked'].includes(d.status)).length;
        const clicked = channelDeliveries.filter(d => d.status === 'clicked').length;

        return {
          sentRate: (sent / total) * 100,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: opened > 0 ? (clicked / opened) * 100 : 0
        };
      };

      const channelPerformance = {
        email: calculatePerformance(emailDeliveries),
        whatsapp: calculatePerformance(whatsappDeliveries)
      };

      // Atividade recente
      const recentActivity = (deliveries || []).map(delivery => ({
        id: delivery.id,
        invite_id: delivery.invite_id,
        channel: delivery.channel,
        status: delivery.status,
        created_at: delivery.created_at,
        email: (delivery as any).invites?.email
      }));

      setAnalytics({
        totalInvites,
        sentByChannel,
        deliveryStats,
        channelPerformance,
        recentActivity
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics:", error);
      toast.error("Erro ao carregar dados de analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return { analytics, loading, fetchAnalytics };
};
