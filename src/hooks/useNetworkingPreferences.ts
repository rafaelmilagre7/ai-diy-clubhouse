import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface NetworkingPreferences {
  user_id: string;
  looking_for?: {
    types: string[];
    industries: string[];
    companySizes: string[];
    locations: string[];
  };
  exclude_sectors?: string[];
  min_compatibility?: number;
  preferred_connections_per_week?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export const useNetworkingPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['networking-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('networking_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as NetworkingPreferences | null;
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async (preferences: Partial<NetworkingPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('networking_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-preferences'] });
    },
  });

  const createDefaultPreferences = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const defaultPrefs = {
        user_id: user.id,
        looking_for: {
          types: ['customer', 'supplier', 'partner'],
          industries: [],
          companySizes: [],
          locations: []
        },
        exclude_sectors: [],
        min_compatibility: 0.70,
        preferred_connections_per_week: 5,
        is_active: true
      };

      const { data, error } = await supabase
        .from('networking_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking-preferences'] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: updateMutation.mutate,
    createDefaultPreferences: createDefaultPreferences.mutate,
    isUpdating: updateMutation.isPending || createDefaultPreferences.isPending,
  };
};