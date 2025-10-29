import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { useToastModern } from '@/hooks/useToastModern';

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
  const { showSuccess, showError, showInfo } = useToastModern();
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

      // 🆕 Buscar convites pendentes da tabela 'invites' (sistema unificado)
      const { data: invites } = await supabase
        .from('invites')
        .select(`
          id, 
          email, 
          expires_at, 
          created_at,
          used_at,
          deleted_at,
          role_id,
          user_roles(name)
        `)
        .eq('created_by', user.id)
        .is('used_at', null)
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString());

      // Mapear para formato TeamInvite
      const mappedInvites: TeamInvite[] = (invites || []).map(invite => ({
        id: invite.id,
        email: invite.email,
        status: 'pending',
        expires_at: invite.expires_at,
        created_at: invite.created_at
      }));

      setTeamMembers(members || []);
      setTeamInvites(mappedInvites);
      setTeamStats({
        current_members: members?.length || 0,
        max_members: organizationData?.max_users || profile.team_size || 1,
        pending_invites: mappedInvites.length,
        plan_type: profile.plan_type || 'individual'
      });

    } catch (error) {
      console.error('Erro ao buscar dados da equipe:', error);
      showError("Erro", "Não foi possível carregar os dados da equipe");
      
      // Mantém toast legado para compatibilidade
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
        showError("Limite atingido", `Seu plano permite até ${teamStats.max_members} membros`);
        
        // Mantém toast legado para compatibilidade
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
        showError("Erro", "Apenas usuários master podem convidar membros");
        
        // Mantém toast legado para compatibilidade
        toast({
          title: "Erro",
          description: "Apenas usuários master podem convidar membros",
          variant: "destructive"
        });
        return false;
      }

      // 🆕 Buscar role "hands_on"
      const { data: handsOnRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'hands_on')
        .single();

      if (!handsOnRole) {
        showError("Erro de configuração", "Role 'hands_on' não encontrado no sistema");
        
        // Mantém toast legado para compatibilidade
        toast({
          title: "Erro de configuração",
          description: "Role 'hands_on' não encontrado no sistema",
          variant: "destructive"
        });
        return false;
      }

      // 🆕 Usar sistema de convites do admin (create_invite_hybrid)
      const { data, error } = await supabase.rpc('create_invite_hybrid', {
        p_email: email.toLowerCase(),
        p_role_id: handsOnRole.id,
        p_phone: null,
        p_expires_in: '7 days',
        p_notes: `Convite para equipe da organização`,
        p_channel_preference: 'email'
      });

      if (error) throw error;

      if (data.status === 'error') {
        throw new Error(data.message);
      }

      // 🆕 Processar envio de email em background
      setTimeout(async () => {
        try {
          const inviteUrl = `${window.location.origin}/convite/${data.token}`;
          
          const { error: sendError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: email.toLowerCase(),
              inviteUrl,
              roleName: 'hands_on',
              expiresAt: data.expires_at,
              senderName: user.email || 'Equipe',
              inviteId: data.invite_id,
              forceResend: true
            }
          });

          if (sendError) {
            console.error('❌ Erro no envio do email:', sendError);
            showError("Convite criado, mas email não foi enviado", "Você pode reenviar o convite manualmente");
            
            // Mantém toast legado para compatibilidade
            toast({
              title: "Convite criado, mas email não foi enviado",
              description: "Você pode reenviar o convite manualmente",
              variant: "destructive"
            });
          } else {
            showSuccess("Convite enviado!", `Email enviado para ${email}`);
            
            // Mantém toast legado para compatibilidade
            toast({
              title: "✅ Convite enviado",
              description: `Email enviado para ${email}`,
            });
          }
        } catch (bgError) {
          console.error('❌ Erro no processamento:', bgError);
        }
      }, 100);

      // Feedback imediato
      showInfo("Convite criado", `Processando envio para ${email}...`);
      
      // Mantém toast legado para compatibilidade
      toast({
        title: "Convite criado",
        description: `Processando envio para ${email}...`,
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      showError("Erro ao enviar convite", error.message || "Não foi possível enviar o convite");
      
      // Mantém toast legado para compatibilidade
      toast({
        title: "Erro ao enviar convite",
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
        showError("Erro", "Apenas usuários master podem remover membros");
        
        // Mantém toast legado para compatibilidade
        toast({
          title: "Erro",
          description: "Apenas usuários master podem remover membros",
          variant: "destructive"
        });
        return false;
      }

      // Não permitir remover a si mesmo
      if (memberId === user.id) {
        showError("Erro", "Você não pode remover a si mesmo da equipe");
        
        // Mantém toast legado para compatibilidade
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

      showSuccess("Membro removido", "Membro removido da equipe com sucesso");
      
      // Mantém toast legado para compatibilidade
      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso",
        variant: "default"
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      showError("Erro", error.message || "Não foi possível remover o membro");
      
      // Mantém toast legado para compatibilidade
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
      // 🆕 Soft delete na tabela 'invites'
      const { error } = await supabase
        .from('invites')
        .update({ 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', inviteId);

      if (error) throw error;

      showSuccess("Convite cancelado", "O convite foi cancelado com sucesso");
      
      // Mantém toast legado para compatibilidade
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso",
        variant: "default"
      });

      await fetchTeamData();
      return true;

    } catch (error: any) {
      console.error('Erro ao cancelar convite:', error);
      showError("Erro ao cancelar convite", error.message || "Não foi possível cancelar o convite");
      
      // Mantém toast legado para compatibilidade
      toast({
        title: "Erro ao cancelar convite",
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