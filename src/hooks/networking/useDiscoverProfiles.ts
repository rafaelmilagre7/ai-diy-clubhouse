import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { NetworkingProfile } from '@/hooks/useNetworkingProfiles';

export const useDiscoverProfiles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['discover-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // 1. Buscar IDs de usuários já conectados ou com solicitação pendente
      const { data: connections } = await supabase
        .from('member_connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      const excludeIds = connections?.flatMap(c => [c.requester_id, c.recipient_id]) || [];
      excludeIds.push(user.id); // Excluir o próprio usuário

      // 2. Buscar TODOS os perfis, exceto os já conectados
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          avatar_url,
          company_name,
          current_position,
          industry,
          linkedin_url,
          professional_bio,
          skills,
          created_at
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .not('name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as NetworkingProfile[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
