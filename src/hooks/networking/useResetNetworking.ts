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
        console.error('Erro na invocação:', error);
        throw new Error(`Falha ao chamar função: ${error.message || 'Erro desconhecido'}`);
      }

      if (!data?.success) {
        const errorMsg = data?.error || 'Erro desconhecido ao processar reset';
        console.error('Reset falhou:', errorMsg);
        throw new Error(errorMsg);
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
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError');
      
      toast.error('Erro ao resetar networking', {
        description: isNetworkError 
          ? 'Falha na conexão. Verifique sua internet e tente novamente.'
          : errorMessage,
        duration: 5000
      });
      
      // Invalidar cache mesmo com erro, caso tenha sido parcialmente bem-sucedido
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['strategic-matches'] }),
        queryClient.invalidateQueries({ queryKey: ['connection-notifications'] })
      ]);
      
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
