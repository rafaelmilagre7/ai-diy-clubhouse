
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InviteCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetRole: string;
  targetRoleName?: string;
  emailTemplate: string;
  whatsappTemplate?: string;
  scheduledFor?: string;
  channels: ('email' | 'whatsapp')[];
  segmentation: {
    industry?: string[];
    companySize?: string[];
    location?: string[];
  };
  followUpRules: {
    enabled: boolean;
    intervals: number[]; // dias
    maxAttempts: number;
  };
  metrics: {
    totalInvites: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    registered: number;
    conversionRate: number;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface CreateCampaignParams {
  name: string;
  description?: string;
  targetRole: string;
  emailTemplate: string;
  whatsappTemplate?: string;
  scheduledFor?: string;
  channels: ('email' | 'whatsapp')[];
  segmentation: {
    industry?: string[];
    companySize?: string[];
    location?: string[];
  };
  followUpRules: {
    enabled: boolean;
    intervals: number[];
    maxAttempts: number;
  };
}

export const useCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<InviteCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar campanhas reais do banco de dados
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

      if (campaignsError) {
        console.error("Erro ao buscar campanhas:", campaignsError);
        toast.error("Erro ao carregar campanhas");
        setCampaigns([]);
        return;
      }

      // Processar campanhas reais (sem dados fictícios)
      const processedCampaigns = campaignsData?.map(campaign => {
        const totalInvites = campaign.campaign_invites?.length || 0;
        const conversions = campaign.campaign_invites?.filter(
          ci => ci.invites?.used_at
        ).length || 0;
        
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          targetRole: campaign.target_role_id,
          targetRoleName: campaign.user_roles?.name,
          emailTemplate: campaign.email_template,
          whatsappTemplate: campaign.whatsapp_template,
          scheduledFor: campaign.scheduled_for,
          channels: campaign.channels || ['email'],
          segmentation: campaign.segmentation || {},
          followUpRules: campaign.follow_up_rules || {
            enabled: false,
            intervals: [],
            maxAttempts: 1
          },
          metrics: {
            totalInvites,
            sent: totalInvites, // Todos os convites da campanha foram enviados
            delivered: 0, // Calcular baseado em invite_deliveries
            opened: 0, // Calcular baseado em invite_analytics_events
            clicked: 0, // Calcular baseado em invite_analytics_events
            registered: conversions,
            conversionRate: totalInvites > 0 ? (conversions / totalInvites) * 100 : 0
          },
          createdAt: campaign.created_at,
          createdBy: campaign.created_by,
          updatedAt: campaign.updated_at
        };
      }) || [];

      setCampaigns(processedCampaigns);
    } catch (error: any) {
      console.error("Erro ao buscar campanhas:", error);
      toast.error("Erro ao carregar campanhas");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = async (params: CreateCampaignParams): Promise<string | null> => {
    try {
      setCreating(true);
      
      const { data, error } = await supabase
        .from('invite_campaigns')
        .insert([{
          name: params.name,
          description: params.description,
          target_role_id: params.targetRole,
          email_template: params.emailTemplate,
          whatsapp_template: params.whatsappTemplate,
          scheduled_for: params.scheduledFor,
          channels: params.channels,
          segmentation: params.segmentation,
          follow_up_rules: params.followUpRules,
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Campanha criada com sucesso!");
      await fetchCampaigns();
      
      return data.id;
    } catch (error: any) {
      console.error("Erro ao criar campanha:", error);
      toast.error("Erro ao criar campanha");
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: InviteCampaign['status']) => {
    try {
      const { error } = await supabase
        .from('invite_campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success(`Campanha ${status === 'active' ? 'ativada' : status === 'paused' ? 'pausada' : 'atualizada'} com sucesso!`);
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao atualizar status da campanha:", error);
      toast.error("Erro ao atualizar campanha");
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('invite_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast.success("Campanha excluída com sucesso!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha");
    }
  };

  const duplicateCampaign = async (campaignId: string) => {
    try {
      const originalCampaign = campaigns.find(c => c.id === campaignId);
      if (!originalCampaign) return;

      const { error } = await supabase
        .from('invite_campaigns')
        .insert([{
          name: `${originalCampaign.name} (Cópia)`,
          description: originalCampaign.description,
          target_role_id: originalCampaign.targetRole,
          email_template: originalCampaign.emailTemplate,
          whatsapp_template: originalCampaign.whatsappTemplate,
          channels: originalCampaign.channels,
          segmentation: originalCampaign.segmentation,
          follow_up_rules: originalCampaign.followUpRules,
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast.success("Campanha duplicada com sucesso!");
      await fetchCampaigns();
    } catch (error: any) {
      console.error("Erro ao duplicar campanha:", error);
      toast.error("Erro ao duplicar campanha");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    creating,
    fetchCampaigns,
    createCampaign,
    updateCampaignStatus,
    deleteCampaign,
    duplicateCampaign
  };
};
