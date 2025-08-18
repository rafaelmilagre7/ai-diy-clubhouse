import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

export const useToolAccess = (toolId: string) => {
  const { user, profile } = useAuth();
  const userRole = profile?.user_roles?.name;

  return useQuery({
    queryKey: ['tool-access', toolId, user?.id, userRole],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id || !toolId) {
        return false;
      }

      // Admin sempre tem acesso
      if (userRole === 'admin') {
        return true;
      }

      try {
        // Verificar acesso usando a função RPC
        const { data, error } = await supabase.rpc('can_access_tool', {
          p_tool_id: toolId,
          p_user_id: user.id
        });

        if (error) {
          console.error('Erro ao verificar acesso à ferramenta:', error);
          return false;
        }

        return data || false;
      } catch (error) {
        console.error('Erro ao verificar acesso à ferramenta:', error);
        return false;
      }
    },
    enabled: !!user?.id && !!toolId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};