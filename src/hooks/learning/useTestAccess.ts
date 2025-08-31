import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

/**
 * Hook de teste para verificar se o acesso ao conteúdo de aprendizado está funcionando
 */
export const useTestAccess = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['test-access', user?.id, Date.now()],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('🧪 [TEST] Testando acesso do usuário:', user.id);

      // Chamar a função de teste criada na migração
      const { data, error } = await supabase.rpc('test_learning_access_debug');
      
      if (error) {
        console.error('❌ [TEST] Erro ao testar acesso:', error);
        throw error;
      }

      console.log('✅ [TEST] Resultado do teste:', data);
      return data;
    },
    enabled: !!user?.id,
    retry: false,
    staleTime: 0,
  });
};