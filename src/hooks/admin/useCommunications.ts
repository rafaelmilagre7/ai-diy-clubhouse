
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AdminCommunication {
  id: string;
  title: string;
  content: string;
  email_subject?: string;
  template_type: string;
  priority: string;
  target_roles: string[];
  delivery_channels: string[];
  status: string;
  scheduled_for?: string;
  created_at: string;
  sent_at?: string;
  created_by: string;
}

export interface Role {
  id: string;
  name: string;
}

export const useCommunications = () => {
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['admin-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any) as AdminCommunication[];
    },
  });

  const { data: availableRoles = [] } = useQuery({
    queryKey: ['available-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return (data as any) as Role[];
    },
  });

  const createCommunication = useMutation({
    mutationFn: async (communication: Omit<AdminCommunication, 'id' | 'created_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('admin_communications')
        .insert({
          ...communication,
          created_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar comunicado: ' + error.message);
    },
  });

  const updateCommunication = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdminCommunication> & { id: string }) => {
      const { data, error } = await supabase
        .from('admin_communications')
        .update(updates as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar comunicado: ' + error.message);
    },
  });

  const deleteCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const { error } = await supabase
        .from('admin_communications')
        .delete()
        .eq('id', communicationId as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao deletar comunicado: ' + error.message);
    },
  });

  const sendCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      // Simular envio já que não temos Edge Functions configuradas
      const { data, error } = await supabase
        .from('admin_communications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', communicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar comunicado: ' + error.message);
    },
  });

  const getDeliveryStats = async (communicationId: string) => {
    // Simular estatísticas já que não temos tabela communication_deliveries
    return {
      email: { total: 0, delivered: 0, pending: 0, failed: 0 },
      notification: { total: 0, delivered: 0, pending: 0, failed: 0 }
    };
  };

  return {
    communications,
    isLoading,
    availableRoles,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
    getDeliveryStats,
  };
};
