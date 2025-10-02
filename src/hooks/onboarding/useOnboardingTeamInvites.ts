import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { createInviteHybrid } from '@/lib/supabase/rpc';

export interface TeamInviteData {
  email: string;
  phone?: string;
  channelPreference: 'email' | 'whatsapp' | 'both';
}

export interface PlanLimits {
  currentMembers: number;
  maxMembers: number;
  planType: string;
  canAddMembers: boolean;
}

export const useOnboardingTeamInvites = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);

  const checkPlanLimits = async (): Promise<PlanLimits | null> => {
    if (!user?.id) return null;

    try {
      // Buscar dados do usuário e organização
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          organization_id,
          plan_type,
          team_size,
          is_master_user
        `)
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Erro ao buscar perfil:', profileError);
        return null;
      }

      // Se não é master, não pode adicionar membros
      if (!profile.is_master_user) {
        return {
          currentMembers: 0,
          maxMembers: 1,
          planType: profile.plan_type || 'individual',
          canAddMembers: false
        };
      }

      let maxMembers = profile.team_size || 1;
      let currentMembers = 1; // Conta o próprio usuário

      // Se tem organização, buscar dados dela
      if (profile.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('max_users')
          .eq('id', profile.organization_id)
          .single();

        if (org?.max_users) {
          maxMembers = org.max_users;
        }

        // Contar membros existentes
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id);

        currentMembers = count || 1;
      }

      const limits: PlanLimits = {
        currentMembers,
        maxMembers,
        planType: profile.plan_type || 'basic',
        canAddMembers: currentMembers < maxMembers
      };

      setPlanLimits(limits);
      return limits;

    } catch (error) {
      console.error('Erro ao verificar limites do plano:', error);
      return null;
    }
  };

  const sendTeamInvites = async (invites: TeamInviteData[]): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      setIsLoading(true);

      // Verificar limites antes de enviar
      const limits = await checkPlanLimits();
      
      if (!limits?.canAddMembers) {
        toast.error('Você não pode adicionar membros neste momento');
        return false;
      }

      const availableSlots = limits.maxMembers - limits.currentMembers;
      
      if (invites.length > availableSlots) {
        toast.error(`Seu plano permite apenas ${availableSlots} membro(s) adicional(is)`);
        return false;
      }

      // Buscar role padrão para membros
      const { data: memberRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'membro_club')
        .single();

      if (!memberRole) {
        toast.error('Erro ao buscar papel de membro');
        return false;
      }

      // Enviar convites em paralelo
      const invitePromises = invites.map(async (invite) => {
        try {
          const result = await createInviteHybrid({
            email: invite.email,
            roleId: memberRole.id,
            phone: invite.phone,
            expiresIn: '14 days',
            notes: 'Convite enviado durante onboarding',
            channelPreference: invite.channelPreference
          });

          if (result.status === 'success') {
            console.log(`✅ Convite criado para ${invite.email}`);
            return { success: true, email: invite.email };
          } else {
            throw new Error(result.message || 'Erro ao criar convite');
          }
        } catch (error: any) {
          console.error(`❌ Erro ao enviar convite para ${invite.email}:`, error);
          return { success: false, email: invite.email, error: error.message };
        }
      });

      const results = await Promise.all(invitePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} convite(s) enviado(s) com sucesso!`);
      }

      if (failureCount > 0) {
        toast.error(`${failureCount} convite(s) falharam`);
      }

      return successCount > 0;

    } catch (error: any) {
      console.error('Erro ao enviar convites da equipe:', error);
      toast.error('Erro ao enviar convites');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    planLimits,
    checkPlanLimits,
    sendTeamInvites
  };
};
