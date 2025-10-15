import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ResetResult {
  success: boolean;
  message: string;
  details?: {
    deleted_matches: number;
    deleted_notifications: number;
    preferences_reset: boolean;
  };
  error?: string;
}

export const useResetNetworking = () => {
  const [isResetting, setIsResetting] = useState(false);
  const queryClient = useQueryClient();

  const resetNetworking = async () => {
    try {
      setIsResetting(true);
      console.log('🔄 Iniciando reset de networking...');

      const { data, error } = await supabase.functions.invoke<ResetResult>(
        'reset-user-networking',
        {
          method: 'POST'
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao resetar networking');
      }

      console.log('✅ Reset concluído:', data);

      // Invalidar todas as queries relacionadas a networking
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['strategic-matches'] }),
        queryClient.invalidateQueries({ queryKey: ['networking-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['connection-notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['networking-preferences'] })
      ]);

      toast.success('Reset concluído com sucesso!', {
        description: `${data.details?.deleted_matches || 0} matches e ${data.details?.deleted_notifications || 0} notificações removidos.`
      });

      // Reload da página para limpar estado local
      setTimeout(() => {
        window.location.reload();
      }, 1500);

      return data;
    } catch (error) {
      console.error('❌ Erro no reset:', error);
      toast.error('Erro ao resetar networking', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    resetNetworking,
    isResetting
  };
};
