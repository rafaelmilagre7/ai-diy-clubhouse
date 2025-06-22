
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdvancedInviteAnalytics {
  overview: {
    totalInvites: number;
    conversionRate: number;
    averageAcceptanceTime: number;
    activeUsers: number;
    completedOnboarding: number;
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
  timeAnalysis: {
    bestDaysToSend: string[];
    bestHoursToSend: number[];
    abandonmentPoints: Array<{
      stage: string;
      abandonmentRate: number;
    }>;
  };
  roleSegmentation: Array<{
    roleId: string;
    roleName: string;
    conversionRate: number;
    avgOnboardingTime: number;
    retentionRate: number;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    invitesSent: number;
    conversionRate: number;
    roi: number;
    createdAt: string;
  }>;
}

export const useAdvancedInviteAnalytics = (timeRange: string = '30d') => {
  const [analytics, setAnalytics] = useState<AdvancedInviteAnalytics>({
    overview: {
      totalInvites: 0,
      conversionRate: 0,
      averageAcceptanceTime: 0,
      activeUsers: 0,
      completedOnboarding: 0
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
    timeAnalysis: {
      bestDaysToSend: [],
      bestHoursToSend: [],
      abandonmentPoints: []
    },
    roleSegmentation: [],
    campaigns: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      
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

      // Buscar dados dos convites com roles
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select(`
          id, email, created_at, used_at, role_id,
          user_roles(id, name),
          invite_deliveries(*)
        `)
        .gte('created_at', startDate.toISOString());

      if (invitesError) throw invitesError;

      // Buscar dados de usuários registrados através dos convites
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, email, created_at, onboarding_completed, onboarding_completed_at,
          analytics(event_type, created_at)
        `)
        .gte('created_at', startDate.toISOString());

      if (profilesError) throw profilesError;

      // Calcular métricas overview
      const totalInvites = invites?.length || 0;
      const registeredUsers = profiles?.length || 0;
      const completedOnboarding = profiles?.filter(p => p.onboarding_completed).length || 0;
      const activeUsers = profiles?.filter(p => 
        p.analytics?.some(a => 
          new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
      ).length || 0;

      const conversionRate = totalInvites > 0 ? (registeredUsers / totalInvites) * 100 : 0;

      // Calcular tempo médio de aceitação
      const acceptedInvites = invites?.filter(i => i.used_at) || [];
      const avgAcceptanceTime = acceptedInvites.length > 0 
        ? acceptedInvites.reduce((acc, invite) => {
            const acceptTime = new Date(invite.used_at!).getTime() - new Date(invite.created_at).getTime();
            return acc + acceptTime;
          }, 0) / acceptedInvites.length / (1000 * 60 * 60) // em horas
        : 0;

      // Calcular funil
      const deliveries = invites?.flatMap(i => i.invite_deliveries || []) || [];
      const funnel = {
        sent: totalInvites,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        opened: deliveries.filter(d => d.status === 'opened').length,
        clicked: deliveries.filter(d => d.status === 'clicked').length,
        registered: registeredUsers,
        active: activeUsers
      };

      // Análise por canal
      const emailDeliveries = deliveries.filter(d => d.channel === 'email');
      const whatsappDeliveries = deliveries.filter(d => d.channel === 'whatsapp');

      const emailConversion = emailDeliveries.length > 0 
        ? (registeredUsers / emailDeliveries.length) * 100 : 0;
      const whatsappConversion = whatsappDeliveries.length > 0 
        ? (registeredUsers / whatsappDeliveries.length) * 100 : 0;

      // Segmentação por role - corrigindo o acesso aos dados
      const roleStats = new Map();
      invites?.forEach(invite => {
        // Corrigir acesso ao user_roles - pode ser array ou objeto
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
            onboardingTimes: []
          });
        }
        roleStats.get(roleName).totalInvites++;
        if (invite.used_at) {
          roleStats.get(roleName).conversions++;
        }
      });

      const roleSegmentation = Array.from(roleStats.values()).map(role => ({
        roleId: role.roleId,
        roleName: role.roleName,
        conversionRate: role.totalInvites > 0 ? (role.conversions / role.totalInvites) * 100 : 0,
        avgOnboardingTime: 0, // Seria calculado com dados de onboarding
        retentionRate: 0 // Seria calculado com dados de atividade
      }));

      setAnalytics({
        overview: {
          totalInvites,
          conversionRate,
          averageAcceptanceTime: avgAcceptanceTime,
          activeUsers,
          completedOnboarding
        },
        funnel,
        channelPerformance: {
          email: {
            conversionRate: emailConversion,
            avgAcceptanceTime: 0, // Seria calculado separadamente
            cost: 0.05, // Estimativa
            roi: emailConversion * 10 // Estimativa baseada na conversão
          },
          whatsapp: {
            conversionRate: whatsappConversion,
            avgAcceptanceTime: 0,
            cost: 0.15, // Estimativa
            roi: whatsappConversion * 10
          }
        },
        timeAnalysis: {
          bestDaysToSend: ['Tuesday', 'Wednesday', 'Thursday'], // Seria calculado com dados reais
          bestHoursToSend: [9, 10, 14, 15], // Seria calculado com dados reais
          abandonmentPoints: [
            { stage: 'Email Delivery', abandonmentRate: 5 },
            { stage: 'Email Open', abandonmentRate: 40 },
            { stage: 'Click', abandonmentRate: 60 },
            { stage: 'Registration', abandonmentRate: 25 }
          ]
        },
        roleSegmentation,
        campaigns: [] // Será implementado quando criarmos campanhas
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
  }, [timeRange]);

  return { analytics, loading, fetchAdvancedAnalytics };
};
