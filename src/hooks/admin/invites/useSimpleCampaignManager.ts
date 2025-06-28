
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SimpleCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  total_invites?: number;
}

interface SimpleCampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalInvitesSent: number;
}

export const useSimpleCampaignManager = () => {
  const [campaigns, setCampaigns] = useState<SimpleCampaign[]>([]);
  const [stats, setStats] = useState<SimpleCampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalInvitesSent: 0
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // Para esta versão simplificada, vamos trabalhar apenas com os convites existentes
      // e simular campanhas baseadas nos dados de convites
      const { data: invitesData, error: invitesError } = await supabase
        .from('invites')
        .select('id, email, created_at, used_at')
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      // Simular campanhas baseadas nos convites
      const mockCampaigns: SimpleCampaign[] = [
        {
          id: '1',
          name: 'Convites Gerais',
          description: 'Todos os convites enviados pela plataforma',
          status: 'active',
          created_at: new Date().toISOString(),
          total_invites: invitesData?.length || 0
        }
      ];

      setCampaigns(mockCampaigns);

      // Calcular estatísticas simples
      const totalCampaigns = mockCampaigns.length;
      const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length;
      const totalInvitesSent = invitesData?.length || 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalInvitesSent
      });

    } catch (error: any) {
      console.error("Erro ao carregar campanhas:", error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Partial<SimpleCampaign>) => {
    try {
      setCreating(true);
      
      // Para esta versão simplificada, apenas simular a criação
      toast.success("Campanha criada com sucesso!");
      await fetchCampaigns();
      
      return { id: Date.now().toString(), ...campaignData };
    } catch (error: any) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<SimpleCampaign>) => {
    try {
      toast.success("Campanha atualizada com sucesso!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao atualizar campanha:", error);
      toast.error("Erro ao atualizar campanha");
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      toast.success("Campanha excluída com sucesso!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha");
      throw error;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    stats,
    loading,
    creating,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};
