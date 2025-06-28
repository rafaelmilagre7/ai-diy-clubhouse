
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SimpleInviteAnalytics {
  totalInvites: number;
  usedInvites: number;
  pendingInvites: number;
  expiredInvites: number;
  conversionRate: number;
  recentInvites: Array<{
    id: string;
    email: string;
    created_at: string;
    used_at: string | null;
    expires_at: string;
  }>;
}

export const useSimpleInviteAnalytics = () => {
  const [analytics, setAnalytics] = useState<SimpleInviteAnalytics>({
    totalInvites: 0,
    usedInvites: 0,
    pendingInvites: 0,
    expiredInvites: 0,
    conversionRate: 0,
    recentInvites: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Buscar convites básicos
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('id, email, created_at, used_at, expires_at')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      const allInvites = invites || [];
      const now = new Date();
      
      const totalInvites = allInvites.length;
      const usedInvites = allInvites.filter(invite => invite.used_at !== null).length;
      const expiredInvites = allInvites.filter(invite => 
        invite.used_at === null && new Date(invite.expires_at) < now
      ).length;
      const pendingInvites = totalInvites - usedInvites - expiredInvites;
      const conversionRate = totalInvites > 0 ? (usedInvites / totalInvites) * 100 : 0;

      setAnalytics({
        totalInvites,
        usedInvites,
        pendingInvites,
        expiredInvites,
        conversionRate,
        recentInvites: allInvites.slice(0, 10)
      });

    } catch (error: any) {
      console.error("Erro ao carregar analytics simples:", error);
      toast.error("Erro ao carregar dados de analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, fetchAnalytics };
};
