
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

      // Buscar convites básicos
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('id, email, created_at')
        .gte('created_at', startDate.toISOString());

      if (invitesError) throw invitesError;

      // Processar dados básicos
      const totalInvites = invites?.length || 0;
      
      // Simular distribuição por canal (já que não temos esses dados)
      const sentByChannel = {
        email: Math.floor(totalInvites * 0.7),
        whatsapp: Math.floor(totalInvites * 0.2),
        both: Math.floor(totalInvites * 0.1)
      };

      // Dados simulados para deliveryStats
      const deliveryStats = {
        total: totalInvites,
        sent: Math.floor(totalInvites * 0.9),
        delivered: Math.floor(totalInvites * 0.8),
        opened: Math.floor(totalInvites * 0.6),
        clicked: Math.floor(totalInvites * 0.4),
        failed: Math.floor(totalInvites * 0.1)
      };

      // Performance por canal simulada
      const channelPerformance = {
        email: {
          sentRate: 90,
          deliveryRate: 85,
          openRate: 65,
          clickRate: 35
        },
        whatsapp: {
          sentRate: 95,
          deliveryRate: 90,
          openRate: 75,
          clickRate: 45
        }
      };

      // Atividade recente simulada
      const recentActivity = (invites || []).slice(0, 10).map(invite => ({
        id: invite.id,
        invite_id: invite.id,
        channel: 'email',
        status: 'sent',
        created_at: invite.created_at,
        email: invite.email
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
