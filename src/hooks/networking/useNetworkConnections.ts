
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface NetworkConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // Dados do usuário
  requester?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    company_name?: string;
    current_position?: string;
    avatar_url?: string;
  };
}

export function useNetworkConnections(type: 'sent' | 'received' | 'accepted' = 'received') {
  return useQuery({
    queryKey: ['network-connections', type],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🔍 Buscando conexões:', type);

      let query = supabase
        .from('network_connections')
        .select('*');

      // Filtrar baseado no tipo
      if (type === 'sent') {
        query = query.eq('requester_id', user.id);
      } else if (type === 'received') {
        query = query.eq('recipient_id', user.id).eq('status', 'pending');
      } else if (type === 'accepted') {
        query = query
          .or(`and(requester_id.eq.${user.id},status.eq.accepted),and(recipient_id.eq.${user.id},status.eq.accepted)`);
      }

      const { data: connections, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar conexões:', error);
        throw error;
      }

      if (!connections || connections.length === 0) {
        return [];
      }

      // Buscar dados dos usuários
      const userIds = new Set<string>();
      connections.forEach(conn => {
        userIds.add(conn.requester_id);
        userIds.add(conn.recipient_id);
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, company_name, current_position, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('❌ Erro ao buscar perfis:', profilesError);
        throw profilesError;
      }

      // Combinar dados
      const enrichedConnections = connections.map(connection => {
        const requester = profiles?.find(p => p.id === connection.requester_id);
        const recipient = profiles?.find(p => p.id === connection.recipient_id);
        
        return {
          ...connection,
          requester: requester ? {
            id: requester.id,
            name: requester.name || 'Usuário',
            email: requester.email,
            company_name: requester.company_name,
            current_position: requester.current_position,
            avatar_url: requester.avatar_url
          } : undefined,
          recipient: recipient ? {
            id: recipient.id,
            name: recipient.name || 'Usuário',
            email: recipient.email,
            company_name: recipient.company_name,
            current_position: recipient.current_position,
            avatar_url: recipient.avatar_url
          } : undefined
        };
      });

      console.log('✅ Conexões encontradas:', enrichedConnections.length);
      return enrichedConnections as NetworkConnection[];
    },
    staleTime: 30 * 1000, // 30 segundos
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

      // Verificar se já existe uma conexão
      const { data: existingConnection } = await supabase
        .from('network_connections')
        .select('id')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .single();

      if (existingConnection) {
        throw new Error('Conexão já existe');
      }

      // Buscar dados do destinatário para o e-mail
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, company_name, current_position')
        .eq('id', recipientId)
        .single();

      if (profileError || !recipientProfile) {
        throw new Error('Erro ao buscar dados do destinatário');
      }

      // Buscar dados do solicitante
      const { data: requesterProfile, error: requesterError } = await supabase
        .from('profiles')
        .select('name, company_name, current_position')
        .eq('id', user.id)
        .single();

      if (requesterError || !requesterProfile) {
        throw new Error('Erro ao buscar dados do solicitante');
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

      // Criar notificação no banco
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'connection_request',
          title: 'Nova solicitação de conexão',
          message: 'Alguém quer se conectar com você no networking',
          data: {
            connection_id: data.id,
            sender_id: user.id
          }
        });

      // Enviar e-mail de notificação
      try {
        const emailResponse = await supabase.functions.invoke('send-connection-email', {
          body: {
            recipientEmail: recipientProfile.email,
            recipientName: recipientProfile.name || 'Usuário',
            requesterName: requesterProfile.name || 'Usuário',
            requesterCompany: requesterProfile.company_name,
            requesterPosition: requesterProfile.current_position,
            connectionId: data.id
          }
        });

        if (emailResponse.error) {
          console.error('Erro ao enviar e-mail de conexão:', emailResponse.error);
          // Não falhar a operação por causa do e-mail
        } else {
          console.log('E-mail de conexão enviado com sucesso');
        }
      } catch (emailError) {
        console.error('Erro ao chamar função de e-mail:', emailError);
        // Não falhar a operação por causa do e-mail
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
      toast.success('Solicitação de conexão enviada! O usuário receberá um e-mail de notificação.');
    },
    onError: (error: any) => {
      console.error('Erro ao criar conexão:', error);
      if (error.message === 'Conexão já existe') {
        toast.error('Você já se conectou com este usuário');
      } else {
        toast.error('Erro ao enviar solicitação. Tente novamente.');
      }
    }
  });
}

export function useUpdateConnectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('network_connections')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Se aceita, criar notificação para o solicitante
      if (status === 'accepted') {
        await supabase
          .from('notifications')
          .insert({
            user_id: data.requester_id,
            type: 'connection_accepted',
            title: 'Conexão aceita',
            message: 'Sua solicitação de conexão foi aceita!',
            data: {
              connection_id: data.id,
              accepter_id: data.recipient_id
            }
          });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
      const message = variables.status === 'accepted' ? 'Conexão aceita!' : 'Solicitação rejeitada';
      toast.success(message);
    },
    onError: (error) => {
      console.error('Erro ao atualizar conexão:', error);
      toast.error('Erro ao processar solicitação. Tente novamente.');
    }
  });
}

export function useConnectionStatus(userId: string) {
  return useQuery({
    queryKey: ['connection-status', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('network_connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data?.status || null;
    },
    enabled: !!userId,
  });
}
