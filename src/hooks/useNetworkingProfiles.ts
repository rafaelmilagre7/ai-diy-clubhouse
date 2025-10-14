import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NetworkingProfile {
  id: string;
  name: string;
  email: string;
  whatsapp_number?: string;
  avatar_url?: string;
  company_name?: string;
  current_position?: string;
  industry?: string;
  role: string;
  linkedin_url?: string;
  professional_bio?: string;
  skills: string[];
  created_at: string;
  is_masked?: boolean; // Indica se os dados estão mascarados
}

export const useNetworkingProfiles = () => {
  const query = useQuery({
    queryKey: ['networking-profiles'],
    queryFn: async () => {
      // Buscar da view segura com dados mascarados
      const { data, error } = await supabase
        .from('profiles_networking_safe')
        .select(`
          id,
          name,
          email,
          whatsapp_number,
          avatar_url,
          company_name,
          current_position,
          industry,
          role,
          linkedin_url,
          professional_bio,
          skills,
          created_at,
          is_masked
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