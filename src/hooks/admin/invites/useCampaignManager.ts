
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_role_id?: string;
  email_template: string;
  whatsapp_template?: string;
  scheduled_for?: string;
  channels: string[];
  segmentation: any;
  follow_up_rules: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Dados calculados
  total_invites?: number;
  sent_invites?: number;
  conversions?: number;
  conversion_rate?: number;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalInvitesSent: number;
  avgConversionRate: number;
}

export const useCampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalInvitesSent: 0,
    avgConversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // Buscar campanhas com dados relacionados
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('invite_campaigns')
        .select(`
          *,
          user_roles:target_role_id(name),
          campaign_invites(
            invite_id,
            invites(id, used_at, created_at)
          )
        `)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Processar dados das campanhas
      const processedCampaigns = campaignsData?.map(campaign => {
        const totalInvites = campaign.campaign_invites?.length || 0;
        const conversions = campaign.campaign_invites?.filter(
          ci => ci.invites?.used_at
        ).length || 0;
        
        return {
          ...campaign,
          total_invites: totalInvites,
          sent_invites: totalInvites, // Assumindo que todos foram enviados
          conversions,
          conversion_rate: totalInvites > 0 ? (conversions / totalInvites) * 100 : 0
        };
      }) || [];

      setCampaigns(processedCampaigns);

      // Calcular estatísticas
      const totalCampaigns = processedCampaigns.length;
      const activeCampaigns = processedCampaigns.filter(c => c.status === 'active').length;
      const totalInvitesSent = processedCampaigns.reduce((sum, c) => sum + (c.total_invites || 0), 0);
      const avgConversionRate = processedCampaigns.length > 0 
        ? processedCampaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / processedCampaigns.length
        : 0;

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalInvitesSent,
        avgConversionRate
      });

    } catch (error: any) {
      console.error("Erro ao carregar campanhas:", error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('invite_campaigns')
        .insert([{
          ...campaignData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Campanha criada com sucesso!");
      await fetchCampaigns();
      
      return data;
    } catch (error: any) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { error } = await supabase
        .from('invite_campaigns')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('invite_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Campanha excluída com sucesso!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha");
      throw error;
    }
  };

  const pauseCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'paused' });
  };

  const resumeCampaign = async (id: string) => {
    await updateCampaign(id, { status: 'active' });
  };

  const addInvitesToCampaign = async (campaignId: string, inviteIds: string[]) => {
    try {
      const campaignInvites = inviteIds.map(inviteId => ({
        campaign_id: campaignId,
        invite_id: inviteId
      }));

      const { error } = await supabase
        .from('campaign_invites')
        .insert(campaignInvites);

      if (error) throw error;

      toast.success("Convites adicionados à campanha!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao adicionar convites à campanha:", error);
      toast.error("Erro ao adicionar convites à campanha");
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
    deleteCampaign,
    pauseCampaign,
    resumeCampaign,
    addInvitesToCampaign
  };
};
