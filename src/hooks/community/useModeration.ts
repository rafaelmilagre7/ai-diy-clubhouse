
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export const useModeration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const pinTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('community_topics')
        .update({ is_pinned: true })
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico fixado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao fixar tópico:', error);
      toast.error('Erro ao fixar tópico');
    }
  });

  const unpinTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('community_topics')
        .update({ is_pinned: false })
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico desfixado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao desfixar tópico:', error);
      toast.error('Erro ao desfixar tópico');
    }
  });

  const lockTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('community_topics')
        .update({ is_locked: true })
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico travado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao travar tópico:', error);
      toast.error('Erro ao travar tópico');
    }
  });

  const unlockTopic = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('community_topics')
        .update({ is_locked: false })
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico destravado com sucesso');
    },
    onError: (error) => {
      console.error('Erro ao destravar tópico:', error);
      toast.error('Erro ao destravar tópico');
    }
  });

  return {
    pinTopic: pinTopic.mutate,
    unpinTopic: unpinTopic.mutate,
    lockTopic: lockTopic.mutate,
    unlockTopic: unlockTopic.mutate,
    isLoading: pinTopic.isPending || unpinTopic.isPending || lockTopic.isPending || unlockTopic.isPending
  };
};
