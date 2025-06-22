
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdvancedAnalyticsData {
  overview: {
    totalInvites: number;
    activeInvites: number;
    conversions: number;
    conversionRate: number;
    avgResponseTime: number;
    costPerConversion: number;
    roi: number;
  };
  timeAnalysis: {
    optimalTimes: number[];
    performanceByHour: Array<{
      hour: number;
      sentCount: number;
      openRate: number;
      clickRate: number;
    }>;
  };
  funnel: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    registered: number;
    active: number;
  };
  channelPerformance: {
    email: {
      conversionRate: number;
      avgAcceptanceTime: number;
      cost: number;
      roi: number;
    };
    whatsapp: {
      conversionRate: number;
      avgAcceptanceTime: number;
      cost: number;
      roi: number;
    };
  };
  roleSegmentation: Array<{
    roleId: string;
    roleName: string;
    conversionRate: number;
    avgOnboardingTime: number;
    retentionRate: number;
  }>;
}

export const useAdvancedInviteAnalytics = () => {
  const [data, setData] = useState<AdvancedAnalyticsData>({
    overview: {
      totalInvites: 0,
      activeInvites: 0,
      conversions: 0,
      conversionRate: 0,
      avgResponseTime: 0,
      costPerConversion: 0,
      roi: 0
    },
    timeAnalysis: {
      optimalTimes: [],
      performanceByHour: []
    },
    funnel: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      registered: 0,
      active: 0
    },
    channelPerformance: {
      email: { conversionRate: 0, avgAcceptanceTime: 0, cost: 0, roi: 0 },
      whatsapp: { conversionRate: 0, avgAcceptanceTime: 0, cost: 0, roi: 0 }
    },
    roleSegmentation: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAdvancedAnalytics = async (timeRange: string = '30days') => {
    try {
      setLoading(true);
      
      // Calcular data de início baseado no range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Buscar dados dos convites com roles e eventos de analytics
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select(`
          id, email, created_at, used_at, role_id,
          user_roles(id, name),
          invite_deliveries(*),
          invite_analytics_events(*)
        `)
        .gte('created_at', startDate.toISOString());

      if (invitesError) throw invitesError;

      // Buscar dados de usuários registrados (profiles criados após convites)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, role_id')
        .gte('created_at', startDate.toISOString());

      if (profilesError) throw profilesError;

      // Buscar dados de onboarding para calcular retenção
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_final')
        .select('user_id, is_completed, completed_at, created_at')
        .gte('created_at', startDate.toISOString());

      if (onboardingError) throw onboardingError;

      // Calcular overview
      const totalInvites = invites?.length || 0;
      const activeInvites = invites?.filter(invite => !invite.used_at && new Date(invite.expires_at) > now).length || 0;
      const conversions = invites?.filter(invite => invite.used_at).length || 0;
      const conversionRate = totalInvites > 0 ? (conversions / totalInvites) * 100 : 0;

      // Calcular tempo médio de resposta
      const acceptedInvites = invites?.filter(invite => invite.used_at) || [];
      const avgResponseTime = acceptedInvites.length > 0 
        ? acceptedInvites.reduce((acc, invite) => {
            const sentTime = new Date(invite.created_at).getTime();
            const acceptedTime = new Date(invite.used_at!).getTime();
            return acc + (acceptedTime - sentTime);
          }, 0) / acceptedInvites.length / (1000 * 60 * 60) // em horas
        : 0;

      // Calcular dados do funil usando eventos de analytics
      const allEvents = invites?.flatMap(invite => invite.invite_analytics_events || []) || [];
      
      const sent = invites?.length || 0;
      const delivered = allEvents.filter(e => e.event_type === 'delivered').length;
      const opened = allEvents.filter(e => e.event_type === 'opened').length;
      const clicked = allEvents.filter(e => e.event_type === 'clicked').length;
      const registered = conversions;
      const active = onboardingData?.filter(o => o.is_completed).length || 0;

      // Análise de performance por canal
      const emailEvents = allEvents.filter(e => e.channel === 'email');
      const whatsappEvents = allEvents.filter(e => e.channel === 'whatsapp');
      
      const emailConversions = emailEvents.filter(e => e.event_type === 'registered').length;
      const whatsappConversions = whatsappEvents.filter(e => e.event_type === 'registered').length;
      
      const emailConversionRate = emailEvents.length > 0 ? (emailConversions / emailEvents.length) * 100 : 0;
      const whatsappConversionRate = whatsappEvents.length > 0 ? (whatsappConversions / whatsappEvents.length) * 100 : 0;

      // Segmentação por role usando dados reais
      const roleStats = new Map();
      invites?.forEach(invite => {
        const roleData = Array.isArray(invite.user_roles) 
          ? invite.user_roles[0] 
          : invite.user_roles;
        
        const roleName = roleData?.name || 'Unknown';
        const roleId = invite.role_id;
        
        if (!roleStats.has(roleName)) {
          roleStats.set(roleName, {
            roleId,
            roleName,
            totalInvites: 0,
            conversions: 0,
            avgOnboardingTime: 0,
            onboardingCompletions: 0
          });
        }
        
        const stats = roleStats.get(roleName);
        stats.totalInvites++;
        
        if (invite.used_at) {
          stats.conversions++;
        }
      });

      // Calcular métricas de onboarding por role
      onboardingData?.forEach(onboarding => {
        const userProfile = profiles?.find(p => p.id === onboarding.user_id);
        if (userProfile) {
          const roleData = invites?.find(inv => inv.role_id === userProfile.role_id)?.user_roles;
          const roleName = Array.isArray(roleData) ? roleData[0]?.name : roleData?.name;
          
          if (roleName && roleStats.has(roleName)) {
            const stats = roleStats.get(roleName);
            if (onboarding.is_completed && onboarding.completed_at) {
              stats.onboardingCompletions++;
              const completionTime = new Date(onboarding.completed_at).getTime() - new Date(onboarding.created_at).getTime();
              stats.avgOnboardingTime += completionTime / (1000 * 60 * 60); // em horas
            }
          }
        }
      });

      // Finalizar cálculos de segmentação por role
      const roleSegmentation = Array.from(roleStats.values()).map(stats => ({
        roleId: stats.roleId,
        roleName: stats.roleName,
        conversionRate: stats.totalInvites > 0 ? (stats.conversions / stats.totalInvites) * 100 : 0,
        avgOnboardingTime: stats.onboardingCompletions > 0 ? stats.avgOnboardingTime / stats.onboardingCompletions : 0,
        retentionRate: stats.conversions > 0 ? (stats.onboardingCompletions / stats.conversions) * 100 : 0
      }));

      // Análise temporal - performance por hora
      const hourlyStats = new Map();
      for (let hour = 0; hour < 24; hour++) {
        hourlyStats.set(hour, { sent: 0, opened: 0, clicked: 0 });
      }

      allEvents.forEach(event => {
        const hour = new Date(event.timestamp).getHours();
        const stats = hourlyStats.get(hour);
        
        if (event.event_type === 'sent') stats.sent++;
        if (event.event_type === 'opened') stats.opened++;
        if (event.event_type === 'clicked') stats.clicked++;
      });

      const performanceByHour = Array.from(hourlyStats.entries()).map(([hour, stats]) => ({
        hour,
        sentCount: stats.sent,
        openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
        clickRate: stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0
      }));

      // Identificar horários ótimos (top 6 horários com melhor performance)
      const optimalTimes = performanceByHour
        .sort((a, b) => (b.openRate + b.clickRate) - (a.openRate + a.clickRate))
        .slice(0, 6)
        .map(item => item.hour);

      setData({
        overview: {
          totalInvites,
          activeInvites,
          conversions,
          conversionRate,
          avgResponseTime,
          costPerConversion: conversions > 0 ? 50 / conversions : 0, // Estimativa
          roi: conversions * 1000 / (totalInvites * 50) // Estimativa
        },
        timeAnalysis: {
          optimalTimes,
          performanceByHour
        },
        funnel: {
          sent,
          delivered,
          opened,
          clicked,
          registered,
          active
        },
        channelPerformance: {
          email: {
            conversionRate: emailConversionRate,
            avgAcceptanceTime: 2.5,
            cost: 5.0,
            roi: emailConversions * 200
          },
          whatsapp: {
            conversionRate: whatsappConversionRate,
            avgAcceptanceTime: 1.2,
            cost: 15.0,
            roi: whatsappConversions * 200
          }
        },
        roleSegmentation
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics avançados:", error);
      toast.error("Erro ao carregar dados de analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  return {
    data,
    loading,
    refresh: fetchAdvancedAnalytics
  };
};
