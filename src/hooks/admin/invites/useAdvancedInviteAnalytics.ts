
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdvancedInviteAnalytics {
  totalInvites: number;
  usedInvites: number;
  pendingInvites: number;
  expiredInvites: number;
  conversionRate: number;
  averageTimeToAccept: number;
  channelPerformance: Array<{
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    conversionRate: number;
  }>;
  timeBasedAnalytics: Array<{
    period: string;
    invitesSent: number;
    acceptanceRate: number;
  }>;
  roleBasedAnalytics: Array<{
    roleName: string;
    totalInvites: number;
    acceptedInvites: number;
    conversionRate: number;
  }>;
}

export const useAdvancedInviteAnalytics = (timeRange: string = '30d') => {
  const [analytics, setAnalytics] = useState<AdvancedInviteAnalytics>({
    totalInvites: 0,
    usedInvites: 0,
    pendingInvites: 0,
    expiredInvites: 0,
    conversionRate: 0,
    averageTimeToAccept: 0,
    channelPerformance: [],
    timeBasedAnalytics: [],
    roleBasedAnalytics: []
  });
  
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calcular data de início baseada no timeRange
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Buscar convites básicos
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          created_at,
          used_at,
          expires_at,
          role_id,
          user_roles:user_roles(name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (invitesError) {
        console.error('Erro ao buscar convites:', invitesError);
        toast.error('Erro ao carregar dados de convites');
        return;
      }

      const allInvites = invites || [];
      const totalInvites = allInvites.length;
      const usedInvites = allInvites.filter(invite => invite.used_at !== null).length;
      const expiredInvites = allInvites.filter(invite => 
        invite.used_at === null && new Date(invite.expires_at) < now
      ).length;
      const pendingInvites = totalInvites - usedInvites - expiredInvites;
      const conversionRate = totalInvites > 0 ? (usedInvites / totalInvites) * 100 : 0;

      // Calcular tempo médio para aceitar
      const acceptedInvites = allInvites.filter(invite => invite.used_at);
      const averageTimeToAccept = acceptedInvites.length > 0 
        ? acceptedInvites.reduce((sum, invite) => {
            const createdAt = new Date(invite.created_at);
            const usedAt = new Date(invite.used_at!);
            return sum + (usedAt.getTime() - createdAt.getTime());
          }, 0) / acceptedInvites.length / (24 * 60 * 60 * 1000) // em dias
        : 0;

      // Processar performance por canal (dados simulados)
      const channelPerformance = ['email', 'whatsapp'].map(channel => {
        const channelInvites = Math.floor(totalInvites / 2); // Distribuição simulada
        const sent = channelInvites;
        const delivered = Math.floor(sent * 0.9);
        const opened = Math.floor(delivered * 0.7);
        const clicked = Math.floor(opened * 0.5);
        
        return {
          channel,
          sent,
          delivered,
          opened,
          clicked,
          conversionRate: sent > 0 ? (clicked / sent) * 100 : 0
        };
      });

      // Análise baseada em roles
      const roleBasedAnalytics = allInvites.reduce((acc: any[], invite) => {
        const roleName = invite.user_roles?.name || 'Sem role';
        const existing = acc.find(item => item.roleName === roleName);
        
        if (existing) {
          existing.totalInvites++;
          if (invite.used_at) existing.acceptedInvites++;
        } else {
          acc.push({
            roleName,
            totalInvites: 1,
            acceptedInvites: invite.used_at ? 1 : 0,
            conversionRate: 0
          });
        }
        return acc;
      }, []);

      // Calcular taxa de conversão por role
      roleBasedAnalytics.forEach(role => {
        role.conversionRate = role.totalInvites > 0 
          ? (role.acceptedInvites / role.totalInvites) * 100 
          : 0;
      });

      // Análise temporal (últimos 7 dias)
      const timeBasedAnalytics = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayInvites = allInvites.filter(invite => {
          const inviteDate = new Date(invite.created_at);
          return inviteDate >= dayStart && inviteDate <= dayEnd;
        });
        
        const dayAccepted = dayInvites.filter(invite => invite.used_at).length;
        
        timeBasedAnalytics.push({
          period: dayStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          invitesSent: dayInvites.length,
          acceptanceRate: dayInvites.length > 0 ? (dayAccepted / dayInvites.length) * 100 : 0
        });
      }

      setAnalytics({
        totalInvites,
        usedInvites,
        pendingInvites,
        expiredInvites,
        conversionRate,
        averageTimeToAccept,
        channelPerformance,
        timeBasedAnalytics,
        roleBasedAnalytics
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics avançados:", error);
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
