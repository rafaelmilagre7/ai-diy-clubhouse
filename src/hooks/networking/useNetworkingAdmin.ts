
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useGenerateMatches() {
  return useMutation({
    mutationFn: async ({ targetUserId, forceRegenerate = false }: { targetUserId?: string; forceRegenerate?: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const userId = targetUserId || user.id;

      console.log('🤖 Gerando matches com IA para usuário:', userId);

      const { data, error } = await supabase.functions.invoke('generate-networking-matches', {
        body: { 
          target_user_id: userId, 
          force_regenerate: forceRegenerate 
        }
      });

      if (error) {
        console.error('❌ Erro ao gerar matches:', error);
        throw error;
      }

      console.log('✅ Matches gerados com IA:', data);
      return data;
    }
  });
}

export function useRunScheduledNetworkingGeneration() {
  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Executando geração programada de matches...');

      const { data, error } = await supabase.functions.invoke('schedule-networking-matches', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro na geração programada:', error);
        throw error;
      }

      console.log('✅ Geração programada concluída:', data);
      return data;
    }
  });
}
