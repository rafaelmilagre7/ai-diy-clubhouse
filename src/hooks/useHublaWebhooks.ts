import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface HublaWebhook {
  id: string;
  event_type: string;
  payload: any;
  headers: any;
  received_at: string;
  processed: boolean;
  processing_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface HublaWebhookStats {
  total: number;
  processed: number;
  pending: number;
  failed: number;
  eventTypes: { [key: string]: number };
}

export const useHublaWebhooks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar todos os webhooks
  const { data: webhooks = [], isLoading, error } = useQuery({
    queryKey: ['hubla-webhooks'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .select('*')
        .order('received_at', { ascending: false });
      
      if (error) throw error;
      return data as HublaWebhook[];
    },
    enabled: !!user?.id
  });

  // Buscar estatísticas dos webhooks
  const { data: stats } = useQuery({
    queryKey: ['hubla-webhook-stats'],
    queryFn: async (): Promise<HublaWebhookStats> => {
      if (!user?.id) return {
        total: 0,
        processed: 0,
        pending: 0,
        failed: 0,
        eventTypes: {}
      };
      
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .select('event_type, processed, processing_notes');
      
      if (error) throw error;
      
      const stats: HublaWebhookStats = {
        total: data.length,
        processed: 0,
        pending: 0,
        failed: 0,
        eventTypes: {}
      };
      
      data.forEach((webhook) => {
        if (webhook.processed) {
          stats.processed++;
        } else {
          stats.pending++;
        }
        
        if (webhook.processing_notes?.includes('error') || webhook.processing_notes?.includes('failed')) {
          stats.failed++;
        }
        
        stats.eventTypes[webhook.event_type] = (stats.eventTypes[webhook.event_type] || 0) + 1;
      });
      
      return stats;
    },
    enabled: !!user?.id
  });

  // Marcar webhook como processado
  const markAsProcessed = useMutation({
    mutationFn: async ({ webhookId, notes }: { webhookId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .update({
          processed: true,
          processing_notes: notes || 'Marcado como processado manualmente',
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Webhook marcado como processado!');
      queryClient.invalidateQueries({ queryKey: ['hubla-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['hubla-webhook-stats'] });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar webhook como processado:', error);
      toast.error('Erro ao marcar webhook como processado');
    }
  });

  // Reprocessar webhook
  const reprocessWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      // Aqui você pode chamar a edge function para reprocessar
      const webhook = webhooks.find(w => w.id === webhookId);
      if (!webhook) throw new Error('Webhook não encontrado');
      
      // Simular reprocessamento por enquanto
      const { data, error } = await supabase
        .from('hubla_webhooks')
        .update({
          processed: false,
          processing_notes: 'Reprocessamento solicitado',
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Webhook será reprocessado!');
      queryClient.invalidateQueries({ queryKey: ['hubla-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['hubla-webhook-stats'] });
    },
    onError: (error: any) => {
      console.error('Erro ao reprocessar webhook:', error);
      toast.error('Erro ao reprocessar webhook');
    }
  });

  // Deletar webhook
  const deleteWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      const { error } = await supabase
        .from('hubla_webhooks')
        .delete()
        .eq('id', webhookId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Webhook deletado!');
      queryClient.invalidateQueries({ queryKey: ['hubla-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['hubla-webhook-stats'] });
    },
    onError: (error: any) => {
      console.error('Erro ao deletar webhook:', error);
      toast.error('Erro ao deletar webhook');
    }
  });

  return {
    webhooks,
    stats,
    isLoading,
    error,
    markAsProcessed: markAsProcessed.mutate,
    isMarkingAsProcessed: markAsProcessed.isPending,
    reprocessWebhook: reprocessWebhook.mutate,
    isReprocessing: reprocessWebhook.isPending,
    deleteWebhook: deleteWebhook.mutate,
    isDeleting: deleteWebhook.isPending
  };
};