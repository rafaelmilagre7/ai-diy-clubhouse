import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PublicProfile {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  linkedin_url?: string;
  professional_bio?: string;
  skills?: string[];
  created_at: string;
  whatsapp_number?: string;
}

export const usePublicProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

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
          created_at,
          whatsapp_number
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as PublicProfile;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });
};

export const useConnectionsCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-connections-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('member_connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId
  });
};

export const usePostsCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-posts-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('community_topics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId
  });
};
