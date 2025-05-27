
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

      // Criar notificação
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-connections'] });
      toast.success('Solicitação de conexão enviada!');
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
