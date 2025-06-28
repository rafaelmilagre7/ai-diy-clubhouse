
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  target_role_id?: string;
  user_roles?: { name: string };
  email_template: string;
  whatsapp_template?: string;
  scheduled_for?: string;
  channels: string[];
  segmentation: any;
  follow_up_rules: any;
  campaign_invites?: Array<{ invite_id: string }>;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export const useCampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      // Buscar campanhas sem joins complexos para evitar erros de tipo
      const { data: campaignsData, error } = await supabase
        .from('invite_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar campanhas:', error);
        toast.error('Erro ao carregar campanhas');
        return;
      }

      // Buscar dados relacionados separadamente
      const campaignsWithRelations = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          // Buscar role information
          let userRoles = null;
          if (campaign.target_role_id) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('name')
              .eq('id', campaign.target_role_id)
              .single();
            userRoles = roleData;
          }

          // Buscar campaign invites
          const { data: invitesData } = await supabase
            .from('campaign_invites')
            .select('invite_id')
            .eq('campaign_id', campaign.id);

          return {
            ...campaign,
            user_roles: userRoles,
            campaign_invites: invitesData || []
          } as Campaign;
        })
      );

      setCampaigns(campaignsWithRelations);
    } catch (error: any) {
      console.error('Erro ao buscar campanhas:', error);
      toast.error('Erro ao carregar campanhas');
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
          name: campaignData.name,
          description: campaignData.description,
          status: campaignData.status || 'draft',
          target_role_id: campaignData.target_role_id,
          email_template: campaignData.email_template,
          whatsapp_template: campaignData.whatsapp_template,
          channels: campaignData.channels || ['email'],
          segmentation: campaignData.segmentation || {},
          follow_up_rules: campaignData.follow_up_rules || { enabled: false },
          scheduled_for: campaignData.scheduled_for,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar campanha:', error);
        toast.error('Erro ao criar campanha');
        return null;
      }

      toast.success('Campanha criada com sucesso!');
      await fetchCampaigns();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar campanha:', error);
      toast.error('Erro ao criar campanha');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>) => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('invite_campaigns')
        .update(updates)
        .eq('id', campaignId);

      if (error) {
        console.error('Erro ao atualizar campanha:', error);
        toast.error('Erro ao atualizar campanha');
        return false;
      }

      toast.success('Campanha atualizada com sucesso!');
      await fetchCampaigns();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar campanha:', error);
      toast.error('Erro ao atualizar campanha');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      setDeleting(true);
      
      // Deletar campaign_invites relacionados primeiro
      await supabase
        .from('campaign_invites')
        .delete()
        .eq('campaign_id', campaignId);

      // Deletar a campanha
      const { error } = await supabase
        .from('invite_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Erro ao deletar campanha:', error);
        toast.error('Erro ao deletar campanha');
        return false;
      }

      toast.success('Campanha deletada com sucesso!');
      await fetchCampaigns();
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar campanha:', error);
      toast.error('Erro ao deletar campanha');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const launchCampaign = async (campaignId: string) => {
    try {
      const success = await updateCampaign(campaignId, { 
        status: 'active',
        scheduled_for: new Date().toISOString()
      });
      
      if (success) {
        toast.success('Campanha lançada com sucesso!');
      }
      
      return success;
    } catch (error: any) {
      console.error('Erro ao lançar campanha:', error);
      toast.error('Erro ao lançar campanha');
      return false;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    creating,
    updating,
    deleting,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    launchCampaign,
    fetchCampaigns
  };
};
