import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

interface MasterTeamMembersParams {
  masterUserId: string;
  organizationId: string;
  enabled?: boolean;
}

export function useMasterTeamMembers({ 
  masterUserId, 
  organizationId,
  enabled = true 
}: MasterTeamMembersParams) {
  return useQuery({
    queryKey: ['master-team-members', masterUserId, organizationId],
    queryFn: async () => {
      if (!masterUserId || !organizationId) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_master_team_members', {
        p_master_user_id: masterUserId,
        p_organization_id: organizationId
      });

      if (error) {
        console.error('[MASTER_MEMBERS] Erro ao buscar membros:', error);
        throw new Error(error.message);
      }

      // Mapear para o formato UserProfile
      const members: UserProfile[] = (data || []).map((member: any) => ({
        id: member.id,
        email: member.email,
        name: member.name,
        avatar_url: member.avatar_url,
        company_name: member.company_name,
        industry: member.industry,
        created_at: member.created_at,
        role_id: member.role_id,
        user_roles: member.user_roles,
        onboarding_completed: member.onboarding_completed
      }));

      console.log(`[MASTER_MEMBERS] ✅ ${members.length} membros carregados para master ${masterUserId}`);
      return members;
    },
    enabled: enabled && !!masterUserId && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos (anteriormente cacheTime)
  });
}
