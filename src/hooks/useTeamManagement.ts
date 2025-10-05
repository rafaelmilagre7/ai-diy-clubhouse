import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role?: string;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

export interface TeamStats {
  current_members: number;
  max_members: number;
  pending_invites: number;
  plan_type: string;
}

export const useTeamManagement = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Buscar organização do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          organization_id,
          plan_type,
          team_size,
          is_master_user,
          user_roles!inner(name)
        `)
        .eq('id', user.id)
        .single();

      let organizationData = null;
      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id, name, max_users, plan_type')
          .eq('id', profile.organization_id)
          .single();
        
        organizationData = org;
      }

      // Verificar se é master user (via flag ou via papel)
      const roleName = (profile as any)?.user_roles?.name;
      const isMasterUser = 
        profile?.is_master_user === true || 
        roleName === 'master_user' ||
        roleName === 'membro_club';

      if (!isMasterUser) {
        // Usuário não é master, não pode acessar gestão de equipe
        setLoading(false);
        setTeamStats(null);
        return;
      }

      // Se for master mas não tem organização, retornar stats básicos para mostrar UI de criação
      if (!profile?.organization_id) {
        setLoading(false);
        setTeamStats({
          current_members: 0,
          max_members: 5, // Limite padrão para novos planos
          pending_invites: 0,
          plan_type: 'team'
        });
        return;
      }

      // Buscar membros da equipe
      const { data: members } = await supabase
        .from('profiles')
        .select('id, email, name, avatar_url, created_at')
        .eq('organization_id', profile.organization_id);

      // Buscar convites pendentes
      const { data: invites } = await supabase
        .from('team_invites')
        .select('id, email, status, expires_at, created_at')
        .eq('organization_id', profile.organization_id);

      setTeamMembers(members || []);
      setTeamInvites(invites || []);
      setTeamStats({
        current_members: members?.length || 0,
        max_members: organizationData?.max_users || profile.team_size || 1,
        pending_invites: invites?.filter(i => i.status === 'pending').length || 0,
        plan_type: profile.plan_type || 'individual'
      });

    } catch (error) {
      console.error('Erro ao buscar dados da equipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da equipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string) => {
    if (!user?.id) return false;

    try {
      // Verificar limite da equipe
      if (teamStats && teamStats.current_members + teamStats.pending_invites >= teamStats.max_members) {
        toast({
          title: "Limite atingido",
          description: `Seu plano permite até ${teamStats.max_members} membros`,
          variant: "destructive"
        });
        return false;
      }

      // Buscar organização
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          organization_id, 
          is_master_user,
          user_roles!inner(name)
        `)
        .eq('id', user.id)
        .single();

      // Verificar se é master user (via flag ou via papel)
      const roleName = (profile as any)?.user_roles?.name;
      const isMasterUser = 
        profile?.is_master_user === true || 
        roleName === 'master_user' ||
        roleName === 'membro_club';

      if (!profile?.organization_id || !isMasterUser) {
        toast({
          title: "Erro",
          description: "Apenas usuários master podem convidar membros",
          variant: "destructive"
        });
        return false;
      }

      // Criar convite
      const { error } = await supabase
        .from('team_invites')
        .insert({
          organization_id: profile.organization_id,
          invited_by: user.id,
          email: email.toLowerCase(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${email}`,
        variant: "default"
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o convite",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user?.id) return false;

    try {
      // Verificar se é master user
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          is_master_user,
          user_roles!inner(name)
        `)
        .eq('id', user.id)
        .single();

      // Verificar se é master user (via flag ou via papel)
      const roleName = (profile as any)?.user_roles?.name;
      const isMasterUser = 
        profile?.is_master_user === true || 
        roleName === 'master_user' ||
        roleName === 'membro_club';

      if (!isMasterUser) {
        toast({
          title: "Erro",
          description: "Apenas usuários master podem remover membros",
          variant: "destructive"
        });
        return false;
      }

      // Não permitir remover a si mesmo
      if (memberId === user.id) {
        toast({
          title: "Erro",
          description: "Você não pode remover a si mesmo da equipe",
          variant: "destructive"
        });
        return false;
      }

      // Remover membro (definir organization_id como null)
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso",
        variant: "default"
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o membro",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Convite cancelado",
        description: "Convite cancelado com sucesso",
        variant: "default"
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao cancelar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cancelar o convite",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user?.id]);

  return {
    teamMembers,
    teamInvites,
    teamStats,
    loading,
    inviteMember,
    removeMember,
    cancelInvite,
    refetch: fetchTeamData
  };
};