
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AdminCommunication {
  id: string;
  title: string;
  content: string;
  content_type: 'html' | 'markdown' | 'text';
  target_roles: string[];
  delivery_channels: string[];
  scheduled_for?: string;
  sent_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  template_type: 'announcement' | 'maintenance' | 'event' | 'educational' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  email_subject?: string;
  metadata: Record<string, any>;
}

export interface CommunicationDelivery {
  id: string;
  communication_id: string;
  user_id: string;
  delivery_channel: string;
  delivered_at: string;
  opened_at?: string;
  clicked_at?: string;
  status: 'pending' | 'delivered' | 'failed' | 'bounced';
  error_message?: string;
  metadata: Record<string, any>;
}

export const useCommunications = () => {
  const queryClient = useQueryClient();

  // Buscar todas as comunicações
  const { data: communications, isLoading } = useQuery({
    queryKey: ['admin-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_communications')
        .select(`
          *,
          profiles!admin_communications_created_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminCommunication[];
    },
  });

  // Buscar roles disponíveis
  const { data: availableRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Buscar estatísticas de uma comunicação
  const getDeliveryStats = useCallback(async (communicationId: string) => {
    const { data, error } = await supabase
      .from('communication_deliveries')
      .select('delivery_channel, status')
      .eq('communication_id', communicationId);

    if (error) throw error;

    const stats = data.reduce((acc, delivery) => {
      const channel = delivery.delivery_channel;
      const status = delivery.status;
      
      if (!acc[channel]) {
        acc[channel] = { total: 0, delivered: 0, failed: 0, pending: 0 };
      }
      
      acc[channel].total++;
      acc[channel][status as keyof typeof acc[typeof channel]]++;
      
      return acc;
    }, {} as Record<string, any>);

    return stats;
  }, []);

  // Criar nova comunicação
  const createCommunication = useMutation({
    mutationFn: async (data: Partial<AdminCommunication>) => {
      const { data: result, error } = await supabase
        .from('admin_communications')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar comunicado: ' + error.message);
    },
  });

  // Atualizar comunicação
  const updateCommunication = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AdminCommunication> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('admin_communications')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communications'] });
      toast.success('Comunicado atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar comunicado: ' + error.message);
    },
  });

  // Deletar comunicação
  const deleteCommunication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_communications')
        .delete()
        .eq('id', id);

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

  // Enviar comunicação
  const sendCommunication = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('send-communication', {
        body: { communicationId: id }
      });

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

  return {
    communications,
    availableRoles,
    isLoading,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    sendCommunication,
    getDeliveryStats,
  };
};
