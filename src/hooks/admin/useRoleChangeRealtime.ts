import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useCacheInvalidation } from './useCacheInvalidation';

/**
 * Hook para detectar mudanças de role em tempo real
 * Notifica usuário quando seu papel é alterado por um admin
 */
export const useRoleChangeRealtime = () => {
  const { user } = useAuth();
  const { invalidateAllUserCaches } = useCacheInvalidation();
  
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('🔄 [ROLE-REALTIME] Configurando listener para mudanças de role...');
    
    // Criar canal Realtime para mudanças no próprio profile
    const channel = supabase
      .channel(`role-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}` // Apenas mudanças no próprio usuário
        },
        async (payload) => {
          console.log('🔔 [ROLE-REALTIME] Detectada mudança no profile:', payload);
          
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Verificar se role_id mudou
          if (newData.role_id !== oldData.role_id) {
            console.log('⚡ [ROLE-REALTIME] Role mudou!', {
              old: oldData.role_id?.substring(0, 8) + '***',
              new: newData.role_id?.substring(0, 8) + '***'
            });
            
            // Invalidar todos os caches
            await invalidateAllUserCaches(user.id);
            
            // Buscar nome do novo role para mostrar no toast
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('name')
              .eq('id', newData.role_id)
              .single();
            
            // Mostrar notificação ao usuário
            toast.warning('⚡ Seu papel foi atualizado', {
              description: `Você agora é: ${roleData?.name || 'novo papel'}. Recarregue a página para ver todas as mudanças.`,
              duration: 10000,
              action: {
                label: 'Recarregar',
                onClick: () => window.location.reload()
              }
            });
          }
        }
      )
      .subscribe();
    
    console.log('✅ [ROLE-REALTIME] Listener configurado com sucesso');
    
    return () => {
      console.log('🔌 [ROLE-REALTIME] Desconectando listener...');
      supabase.removeChannel(channel);
    };
  }, [user?.id, invalidateAllUserCaches]);
};
