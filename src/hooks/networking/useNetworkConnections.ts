
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NetworkConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  connection_type: string;
  created_at: string;
  updated_at: string;
  // Dados do outro usuário na conexão
  other_user?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
}

export function useNetworkConnections() {
  return useQuery({
    queryKey: ['network-connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('network_connections')
        .select(`
          *,
          requester:profiles!network_connections_requester_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          ),
          recipient:profiles!network_connections_recipient_id_fkey(
            id, name, email, company_name, current_position, avatar_url
          )
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Mapear para incluir other_user baseado na perspectiva do usuário atual
      return data.map(connection => ({
        ...connection,
        other_user: connection.requester_id === user.id 
          ? connection.recipient 
          : connection.requester
      })) as NetworkConnection[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('network_connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    }
  });
}

export function useUpdateConnectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: 'accepted' | 'declined' }) => {
      const { data, error } = await supabase
        .from('network_connections')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
    }
  });
}
