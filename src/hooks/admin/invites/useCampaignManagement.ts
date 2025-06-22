
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
      
      // Por enquanto, vamos simular dados até termos a tabela no banco
      const mockCampaigns: InviteCampaign[] = [
        {
          id: '1',
          name: 'Campanha Q4 - Novos Membros',
          description: 'Captação de novos membros para Q4',
          status: 'active',
          targetRole: 'member',
          targetRoleName: 'Membro',
          emailTemplate: 'template-welcome-member',
          channels: ['email', 'whatsapp'],
          segmentation: {
            industry: ['tecnologia', 'marketing'],
            companySize: ['startup', 'pequena']
          },
          followUpRules: {
            enabled: true,
            intervals: [3, 7, 14],
            maxAttempts: 3
          },
          metrics: {
            totalInvites: 150,
            sent: 150,
            delivered: 142,
            opened: 85,
            clicked: 32,
            registered: 18,
            conversionRate: 12.0
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin',
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Formação - Especialistas IA',
          description: 'Convites para especialistas em IA',
          status: 'paused',
          targetRole: 'formacao',
          targetRoleName: 'Formação',
          emailTemplate: 'template-welcome-formacao',
          channels: ['email'],
          segmentation: {
            industry: ['tecnologia', 'educacao'],
            companySize: ['media', 'grande']
          },
          followUpRules: {
            enabled: false,
            intervals: [],
            maxAttempts: 1
          },
          metrics: {
            totalInvites: 50,
            sent: 45,
            delivered: 43,
            opened: 28,
            clicked: 12,
            registered: 8,
            conversionRate: 16.0
          },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'admin',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (error: any) {
      console.error("Erro ao buscar campanhas:", error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = async (params: CreateCampaignParams): Promise<string | null> => {
    try {
      setCreating(true);
      
      // Simular criação até termos a tabela
      const newCampaign: InviteCampaign = {
        id: Math.random().toString(36).substr(2, 9),
        ...params,
        status: 'draft',
        metrics: {
          totalInvites: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          registered: 0,
          conversionRate: 0
        },
        createdAt: new Date().toISOString(),
        createdBy: 'current-user',
        updatedAt: new Date().toISOString()
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      toast.success("Campanha criada com sucesso!");
      
      return newCampaign.id;
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
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status, updatedAt: new Date().toISOString() }
            : campaign
        )
      );
      
      toast.success(`Campanha ${status === 'active' ? 'ativada' : status === 'paused' ? 'pausada' : 'atualizada'} com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao atualizar status da campanha:", error);
      toast.error("Erro ao atualizar campanha");
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      toast.success("Campanha excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha");
    }
  };

  const duplicateCampaign = async (campaignId: string) => {
    try {
      const originalCampaign = campaigns.find(c => c.id === campaignId);
      if (!originalCampaign) return;

      const duplicatedCampaign: InviteCampaign = {
        ...originalCampaign,
        id: Math.random().toString(36).substr(2, 9),
        name: `${originalCampaign.name} (Cópia)`,
        status: 'draft',
        metrics: {
          totalInvites: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          registered: 0,
          conversionRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCampaigns(prev => [duplicatedCampaign, ...prev]);
      toast.success("Campanha duplicada com sucesso!");
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
