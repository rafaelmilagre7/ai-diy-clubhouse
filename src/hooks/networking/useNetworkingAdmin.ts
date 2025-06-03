
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

      console.log('🤖 Gerando matches para usuário:', userId);

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

      console.log('✅ Matches gerados:', data);
      return data;
    }
  });
}
