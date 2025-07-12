import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkingProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  role: string;
  linkedin_url?: string;
  professional_bio?: string;
  skills: string[];
  created_at: string;
}

export const useNetworkingProfiles = () => {
  const query = useQuery({
    queryKey: ['networking-profiles'],
    queryFn: async () => {
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
          role,
          linkedin_url,
          professional_bio,
          skills,
          created_at
        `)
        .not('name', 'is', null)
        .limit(20);

      if (error) throw error;
      return data as NetworkingProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    ...query,
    refetch: query.refetch
  };
};